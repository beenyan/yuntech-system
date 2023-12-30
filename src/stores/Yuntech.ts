import { ref, Ref } from 'vue';
import { defineStore } from 'pinia';
import { snackbarShow, SnackbarStatus, snackbar } from '../modules/Utils.js';
import { getClient, ResponseType, Body } from '@tauri-apps/api/http';
import { useCookiesStore } from '../stores/Cookies.js';
import router from '../router.js';

const COURSE_REGISTER_URL = 'https://webapp.yuntech.edu.tw/AAXCCS/CourseSelectionRegister.aspx';
const SEARCH_COURSE_URL = 'https://webapp.yuntech.edu.tw/AAXCCS/CourseSelectionRegister.aspx';
const LOGIN_URL = 'https://webapp.yuntech.edu.tw/YunTechSSO/Account/Login';
const LOGIN_CHECK_URL = 'https://webapp.yuntech.edu.tw/YunTechSSO/Account/IsLogined';

const cookiesManager = useCookiesStore();

class CourseStruct {
  select: boolean;
  currentSubj: string;
  deptCourNo: string;
  courseName: string;
  class: string;
  subjTeam: string;
  majOpChn: string;
  credits: string;
  classRoom: string;
  teacher: string;
  selNo: string;
  maxNumber: string;
  courRemark: string;
  constructor(e: HTMLInputElement) {
    const tdList = e.querySelectorAll('td');
    const contentList = Array.from(tdList).map((e) => e.textContent);

    this.select = false;
    this.currentSubj = contentList[1] ?? '';
    this.deptCourNo = contentList[2] ?? '';
    this.courseName = contentList[3] ?? '';
    this.class = contentList[4] ?? '';
    this.subjTeam = contentList[5] ?? '';
    this.majOpChn = contentList[6] ?? '';
    this.credits = contentList[7] ?? '';
    this.classRoom = (contentList[8] ?? '').replace(/([-//])/g, ' $1 ');
    this.teacher = contentList[9] ?? '';
    this.selNo = (contentList[10] ?? '').replace(/([//])/g, ' $1 ');
    this.maxNumber = contentList[11] ?? '';
    this.courRemark = contentList[12] ?? '';
  }
}

class CourseCheckStruct {
  select: boolean;
  currentSubj: string;
  deptCourNo: string;
  courseName: string;
  teacher: string;
  selNo: string;
  maxNumber: string;
  courRemark: string;
  courseStatus: string;

  constructor(tr: HTMLTableRowElement) {
    const tdList = tr.querySelectorAll('td');
    const contentList = Array.from(tdList).map((td) => td.textContent);

    this.select = false;
    this.currentSubj = contentList[1] ?? '';
    this.deptCourNo = contentList[2] ?? '';
    this.courseName = contentList[3] ?? '';
    this.teacher = contentList[9] ?? '';
    this.selNo = (contentList[10] ?? '').replace(/([//])/g, ' $1 ');
    this.maxNumber = contentList[11] ?? '';
    this.courRemark = contentList[12] ?? '';
    this.courseStatus = tdList[13].outerHTML ?? '';
  }
}

async function getLoginToken(): Promise<string> {
  snackbarShow(`取得 Toekn...`, SnackbarStatus.Executing);

  const client = await getClient();
  return new Promise(async (resolve, rejects) => {
    client
      .get<string>(LOGIN_URL, { responseType: ResponseType.Text })
      .then(async (response) => {
        const html = response.data;
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const input = <HTMLInputElement>doc.querySelector('input[name="__RequestVerificationToken"]');

        if (input === null) return rejects('無法取得 Token');

        const cookieList = response.rawHeaders['set-cookie'];

        if (cookieList) {
          cookiesManager.setCookies(cookieList);
        }

        return resolve(input.value);
      })
      .catch((err) => rejects(err));
  });
}

const optionConvertObject = (nodeList: NodeListOf<Element>) => {
  return ([...nodeList] as Array<HTMLOptionElement>).map((x) => ({ value: x.value, title: x.text })).filter((x) => x.value !== '');
};

export const useYuntechStore = defineStore('Yuntech', () => {
  enum EVENTTARGET {
    // 查詢
    Query = 'ctl00$ContentPlaceHolder1$QueryButton',
    // 登記
    Register = 'ctl00$ContentPlaceHolder1$RegisterButton1',
    // 確認
    Check = 'ctl00$ContentPlaceHolder1$NextStepButton',
    // 送出
    Send = 'ctl00$ContentPlaceHolder1$SaveButton',
    // 更換 College
    ChangeCollege = 'ctl00$ContentPlaceHolder1$CollegeDDL',
    // 刪除
    Delete = 'ctl00$ContentPlaceHolder1$DeleteButton',
    // 上一步
    PreStep = 'ctl00$ContentPlaceHolder1$PreviousStepButton',
  }
  const showCheckResiterCourseDialog = ref(false);
  const currentCoursePage = ref('');
  const courseList = ref(Array<CourseStruct>(0));
  const DATA: any = ref({
    college: [],
    department: [],
    dayNight: [],
    eduSys: [],
    majOp: [],
    days: ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'],
    courSession: [
      { title: '08:10~09:00', value: 'A' },
      { title: '09:10~10:00', value: 'B' },
      { title: '10:10~11:00', value: 'C' },
      { title: '11:10~12:00', value: 'D' },
      { title: '13:10~14:00', value: 'E' },
      { title: '14:10~15:00', value: 'F' },
      { title: '15:10~16:00', value: 'G' },
      { title: '16:10~17:00', value: 'H' },
      { title: '18:25~19:15', value: 'I' },
      { title: '19:20~20:10', value: 'J' },
      { title: '20:15~21:05', value: 'K' },
      { title: '21:10~22:00', value: 'L' },
      { title: '12:10~13:00', value: 'Y' },
      { title: '17:10~18:00', value: 'Z' },
    ],
    courProgram: [],
  });
  const courseTable: any = ref({
    headers: [
      { title: '課程時段' },
      { title: '星期一' },
      { title: '星期二' },
      { title: '星期三' },
      { title: '星期四' },
      { title: '星期五' },
      { title: '星期六' },
      { title: '星期日' },
    ],
    schedule: [],
  });
  const courseCheckTable: Ref<{ headers: { title: string }[]; schedule: CourseCheckStruct[]; btn: { showNextBtn: boolean } }> = ref({
    headers: [
      { title: '✓' },
      { title: '學期課號' },
      { title: '系所課號' },
      { title: '課程名稱' },
      { title: '授課教師' },
      { title: '修課人數' },
      { title: '人數限制' },
      { title: '備註' },
      { title: '選課狀態' },
    ],
    schedule: [],
    btn: {
      showNextBtn: false,
    },
  });

  const parseToken = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const __VIEWSTATE = (<HTMLInputElement>doc.querySelector('#__VIEWSTATE')).value;
    const __VIEWSTATEGENERATOR = (<HTMLInputElement>doc.querySelector('#__VIEWSTATEGENERATOR')).value;
    const __VIEWSTATEENCRYPTED = (<HTMLInputElement>doc.querySelector('#__VIEWSTATEENCRYPTED')).value;
    const __EVENTVALIDATION = (<HTMLInputElement>doc.querySelector('#__EVENTVALIDATION')).value;

    DATA.value.college = optionConvertObject(doc.querySelectorAll('#ContentPlaceHolder1_CollegeDDL option'));
    DATA.value.dayNight = optionConvertObject(doc.querySelectorAll('#ContentPlaceHolder1_DayNightDDL option'));
    DATA.value.eduSys = optionConvertObject(doc.querySelectorAll('#ContentPlaceHolder1_EduSysDDL option'));
    DATA.value.majOp = optionConvertObject(doc.querySelectorAll('#ContentPlaceHolder1_MajOpDDL option'));
    DATA.value.courProgram = optionConvertObject(doc.querySelectorAll('#ContentPlaceHolder1_CourProgramDDL option'));

    [...doc.querySelectorAll('#ContentPlaceHolder1_CourseScheduleTable tbody tr')].forEach((row, index) => {
      const tdList = row.querySelectorAll('td');
      courseTable.value.schedule[index] = {
        time: {
          title: tdList[0].textContent,
          class: tdList[0].className,
        },
        monday: {
          title: tdList[1].querySelector('.contentTitle')?.textContent,
          class: tdList[1].className,
        },
        tuesday: {
          title: tdList[2].querySelector('.contentTitle')?.textContent,
          class: tdList[2].className,
        },
        wednesday: {
          title: tdList[3].querySelector('.contentTitle')?.textContent,
          class: tdList[3].className,
        },
        thursday: {
          title: tdList[4].querySelector('.contentTitle')?.textContent,
          class: tdList[4].className,
        },
        friday: {
          title: tdList[5].querySelector('.contentTitle')?.textContent,
          class: tdList[5].className,
        },
        saturday: {
          title: tdList[6].querySelector('.contentTitle')?.textContent,
          class: tdList[6].className,
        },
        sunday: {
          title: tdList[7].querySelector('.contentTitle')?.textContent,
          class: tdList[7].className,
        },
      };
    });
    const dataRows = <NodeListOf<HTMLInputElement>>doc.querySelectorAll('tr.text-center');
    courseList.value = Array.from(dataRows).map((e) => new CourseStruct(e));

    return {
      __VIEWSTATE,
      __VIEWSTATEGENERATOR,
      __VIEWSTATEENCRYPTED,
      __EVENTVALIDATION,
    };
  };

  async function checkLogin(printError: boolean) {
    snackbarShow(`驗證登入 Token...`, SnackbarStatus.Executing);

    try {
      const client = await getClient({ maxRedirections: 0 });
      const response = await client.get<string>(LOGIN_CHECK_URL, {
        headers: {
          Cookie: cookiesManager.getCookies(),
        },
        responseType: ResponseType.Text,
      });

      if (response.data !== 'True') {
        if (location.pathname !== '/login') {
          router.replace({ path: '/login' });
        }

        if (printError) throw new Error('登入失敗');
        snackbar.value.show = false;
        return;
      }

      snackbarShow(`登入成功`);
    } catch (error: any) {
      snackbarShow(`登入檢查錯誤: ${error}`, SnackbarStatus.Error);
    } finally {
    }
  }

  async function login(pLoginName: string, pLoginPassword: string) {
    if (pLoginName === '' || pLoginPassword === '') return;
    localStorage.setItem('username', pLoginName);
    localStorage.setItem('password', pLoginPassword);

    try {
      const token = await getLoginToken();
      snackbarShow(`登入中...`, SnackbarStatus.Executing);

      const client = await getClient({ maxRedirections: 0 });
      const body = Body.form({
        __RequestVerificationToken: token,
        pRememberMe: 'true',
        pLoginName,
        pLoginPassword,
      });

      const response = await client.post<string>(LOGIN_URL, body, {
        headers: { Cookie: cookiesManager.getCookies() },
        responseType: ResponseType.Text,
      });

      const html = response.data;
      const err = html.match(/toastr\.error\("(.*)"\)/);

      if (err && err[1]) throw new Error(err[1]);

      cookiesManager.setCookies(response.rawHeaders['set-cookie']);

      await checkLogin(true);

      return true;
    } catch (error: any) {
      snackbarShow(`登入失敗 ${error}`, SnackbarStatus.Error);
    }
  }

  async function query(extra?: Record<string, string>): Promise<string> {
    const client = await getClient({ maxRedirections: 0 });
    const body = Body.form({
      ...parseToken(currentCoursePage.value),
      ...extra,
    });

    const response = await client.post<string>(SEARCH_COURSE_URL, body, {
      headers: {
        Cookie: cookiesManager.getCookies(),
      },
      responseType: ResponseType.Text,
    });

    const html = response.data;
    currentCoursePage.value = html;

    parseToken(html);

    return html;
  }

  async function courseRegisterEnter() {
    const client = await getClient({ maxRedirections: 0 });
    let response = await client.get<string>(SEARCH_COURSE_URL, {
      headers: {
        Cookie: cookiesManager.getCookies(),
      },
      responseType: ResponseType.Text,
    });

    while (response.status == 302) {
      response = await client.get<string>('https://webapp.yuntech.edu.tw/AAXCCS/Login.aspx?redirectUrl=/AAXCCS/CourseSelectionRegister.aspx', {
        headers: {
          Cookie: cookiesManager.getCookies(),
        },
        responseType: ResponseType.Text,
      });
    }

    parseToken(response.data);
    currentCoursePage.value = response.data;
  }

  async function searchCourse(extra?: Record<string, string>) {
    try {
      const html = await query({ __EVENTTARGET: EVENTTARGET.Query, ...extra });

      const errorMsg = html.match(/ShowAlertWindow\('([^']*)'/);
      if (errorMsg != null) {
        throw new Error(errorMsg[1]);
      }

      parseToken(html);
      snackbarShow(`課程數量: ${courseList.value.length}`);
    } catch (error) {
      snackbarShow(`搜尋失敗: ${error}`, SnackbarStatus.Error);
    }
  }

  async function updateDepartments(extra?: Record<string, string>) {
    const html = await query(extra);
    const doc = new DOMParser().parseFromString(html, 'text/html');
    DATA.value.department = optionConvertObject(doc.querySelectorAll('#ContentPlaceHolder1_DepartmentDDL option'));
  }

  async function selectCourse(extra?: Record<string, string>) {
    const select = courseList.value.filter((c) => c.select);
    if (select.length == 0) {
      return snackbarShow('請至少勾選一門要加選的課程！', SnackbarStatus.Error);
    }

    snackbarShow('登記課程...', SnackbarStatus.Executing);
    const data: Record<string, string> = { __EVENTTARGET: EVENTTARGET.Register, ...extra };
    courseList.value.forEach((course, index) => {
      if (!course.select) return;
      data[`ctl00$ContentPlaceHolder1$QueryCourseGridView$ctl${(index + 2).toString().padStart(2, '0')}$SelectCheckBox`] = 'on';
    });

    await query(data);
  }

  async function checkQuery(extra?: Record<string, string>): Promise<string> {
    const client = await getClient({ maxRedirections: 0 });
    const body = Body.form({
      ...parseToken(currentCoursePage.value),
      ...extra,
    });

    const response = await client.post<string>(COURSE_REGISTER_URL, body, {
      headers: {
        Cookie: cookiesManager.getCookies(),
      },
      responseType: ResponseType.Text,
    });

    const html = response.data;
    currentCoursePage.value = html;
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const trList = doc.querySelectorAll('#ContentPlaceHolder1_CourseCheckListGridView tbody tr.text-center') as NodeListOf<HTMLTableRowElement>;
    courseCheckTable.value.schedule = [...trList].map((tr) => new CourseCheckStruct(tr));

    courseCheckTable.value.btn.showNextBtn = doc.querySelector('#ContentPlaceHolder1_SaveButton') !== null;
    parseToken(html);

    return html;
  }

  async function registerSelectCourse(extra?: Record<string, string>) {
    const data = { __EVENTTARGET: EVENTTARGET.Check, ...extra };
    await checkQuery(data);
    showCheckResiterCourseDialog.value = true;
  }

  async function checkDelete(extra?: Record<string, string>) {
    const data = { __EVENTTARGET: EVENTTARGET.Delete, ...extra };
    await checkQuery(data);
    if (courseCheckTable.value.schedule.length == 0) {
      await checkPreStep();
    }
  }

  async function checkPreStep(extra?: Record<string, string>) {
    const data = { __EVENTTARGET: EVENTTARGET.PreStep, ...extra };
    await checkQuery(data);
    showCheckResiterCourseDialog.value = false;
  }

  async function checkSend(extra?: Record<string, string>) {
    const data = { __EVENTTARGET: EVENTTARGET.Send, ...extra };
    await checkQuery(data);
    await courseRegisterEnter();
    showCheckResiterCourseDialog.value = false;

    snackbarShow('選課成功');
  }

  function isShowcheckOrDeleteCourseBtn(): boolean {
    return currentCoursePage.value.search('id="ContentPlaceHolder1_NextStepButton"') !== -1;
  }

  return {
    checkLogin,
    login,
    courseRegisterEnter,
    DATA,
    courseTable,
    courseList,
    searchCourse,
    updateDepartments,
    EVENTTARGET,
    selectCourse,
    isShowcheckOrDeleteCourseBtn,
    registerSelectCourse,
    showCheckResiterCourseDialog,
    courseCheckTable,
    checkDelete,
    checkPreStep,
    checkSend,
  };
});
