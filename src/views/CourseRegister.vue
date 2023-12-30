<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';
import { snackbarShow, SnackbarStatus } from '../modules/Utils.js';
import { useYuntechStore } from '../stores/Yuntech.js';
import CheckCourse from '../components/CheckCourse.vue';
import CustomSelect from '../components/CustomSelect.vue';

const yuntechManager = useYuntechStore();
const ctl00$ContentPlaceHolder1$CollegeDDL = ref(null);
const ctl00$ContentPlaceHolder1$DepartmentDDL = ref(null);
const ctl00$ContentPlaceHolder1$DayNightDDL = ref('1');
const ctl00$ContentPlaceHolder1$EduSysDDL = ref('B');
const ctl00$ContentPlaceHolder1$MajOpDDL = ref(null);
const ctl00$ContentPlaceHolder1$CurrentSubjTextBox = ref(null);
const ctl00$ContentPlaceHolder1$CourseNameTextBox = ref('');
const ctl00$ContentPlaceHolder1$TeacherNameTextBox = ref('');
const ctl00$ContentPlaceHolder1$CourProgramDDL = ref(null);
const ctl00$ContentPlaceHolder1$WeekCB = ref(Array(7).fill(false));
const ctl00$ContentPlaceHolder1$CourSessionCB = ref(Array(14).fill(false));
const searchLoading = ref(false);
const selectCourseLoading = ref(false);
const updateDepartments = async () => {
  await nextTick();

  ctl00$ContentPlaceHolder1$DepartmentDDL.value = null;
  const data = prepareBody({
    __EVENTTARGET: yuntechManager.EVENTTARGET.Query,
  });
  await yuntechManager.updateDepartments(data);
};

const prepareBody = (extra?: Record<string, string>) => {
  const data: Record<string, string> = {
    ctl00$ContentPlaceHolder1$CollegeDDL: ctl00$ContentPlaceHolder1$CollegeDDL.value ?? '',
    ctl00$ContentPlaceHolder1$DepartmentDDL: ctl00$ContentPlaceHolder1$DepartmentDDL.value ?? '',
    ctl00$ContentPlaceHolder1$DayNightDDL: ctl00$ContentPlaceHolder1$DayNightDDL.value,
    ctl00$ContentPlaceHolder1$EduSysDDL: ctl00$ContentPlaceHolder1$EduSysDDL.value,
    ctl00$ContentPlaceHolder1$MajOpDDL: ctl00$ContentPlaceHolder1$MajOpDDL.value ?? '',
    ctl00$ContentPlaceHolder1$CurrentSubjTextBox: ctl00$ContentPlaceHolder1$CurrentSubjTextBox.value ?? '',
    ctl00$ContentPlaceHolder1$CourseNameTextBox: ctl00$ContentPlaceHolder1$CourseNameTextBox.value,
    ctl00$ContentPlaceHolder1$TeacherNameTextBox: ctl00$ContentPlaceHolder1$TeacherNameTextBox.value,
    ctl00$ContentPlaceHolder1$CourProgramDDL: ctl00$ContentPlaceHolder1$CourProgramDDL.value ?? '',

    ...extra,
  };

  ctl00$ContentPlaceHolder1$WeekCB.value.forEach((value, index) => {
    if (!value) return;

    data[`ctl00$ContentPlaceHolder1$WeekCB${index + 1}`] = 'on';
  });

  ctl00$ContentPlaceHolder1$CourSessionCB.value.forEach((value, index) => {
    if (!value) return;

    data[`ctl00$ContentPlaceHolder1$CourSessionCB${index + 1}`] = value;
  });

  return data;
};

const searchCourse = async () => {
  try {
    searchLoading.value = true;
    snackbarShow('開始搜尋...', SnackbarStatus.Executing);

    const data = prepareBody();
    await yuntechManager.searchCourse(data);
  } catch (error) {
    snackbarShow(`${error}`, SnackbarStatus.Error);
  } finally {
    searchLoading.value = false;
  }
};

const selectCourse = async () => {
  try {
    selectCourseLoading.value = true;
    const data = prepareBody();
    await yuntechManager.selectCourse(data);
    await searchCourse();
  } catch (error) {
    snackbarShow(`${error}`, SnackbarStatus.Error);
  } finally {
    selectCourseLoading.value = false;
  }
};

const registerSelectCourse = async () => {
  try {
    const data = prepareBody();
    await yuntechManager.registerSelectCourse(data);
  } catch (error) {
    snackbarShow(`${error}`, SnackbarStatus.Error);
  } finally {
  }
};

const clear = () => {
  ctl00$ContentPlaceHolder1$CollegeDDL.value = null;
  ctl00$ContentPlaceHolder1$DepartmentDDL.value = null;
  ctl00$ContentPlaceHolder1$DayNightDDL.value = '1';
  ctl00$ContentPlaceHolder1$EduSysDDL.value = 'B';
  ctl00$ContentPlaceHolder1$MajOpDDL.value = null;
  ctl00$ContentPlaceHolder1$CurrentSubjTextBox.value = null;
  ctl00$ContentPlaceHolder1$CourseNameTextBox.value = '';
  ctl00$ContentPlaceHolder1$TeacherNameTextBox.value = '';
  ctl00$ContentPlaceHolder1$CourProgramDDL.value = null;
  ctl00$ContentPlaceHolder1$WeekCB.value = Array(7).fill(false);
  ctl00$ContentPlaceHolder1$CourSessionCB.value = Array(14).fill(false);
  yuntechManager.courseList.length = 0;
};

onMounted(async () => {
  await yuntechManager.checkLogin(false);
  await yuntechManager.courseRegisterEnter();
});
</script>

<template>
  <v-container class="text-center">
    <v-row justify="center">
      <v-col>
        <v-row class="d-flex align-center">
          <v-col class="text-right" cols="3">開課系所</v-col>

          <v-col>
            <CustomSelect
              label="選擇學院"
              :items="yuntechManager.DATA.college"
              v-model="ctl00$ContentPlaceHolder1$CollegeDDL"
              @update:model-value="updateDepartments"
            ></CustomSelect>
          </v-col>

          <v-col>
            <CustomSelect
              label="選擇系所"
              :loading="ctl00$ContentPlaceHolder1$CollegeDDL !== null"
              :disabled="ctl00$ContentPlaceHolder1$CollegeDDL === null"
              :items="yuntechManager.DATA.department"
              v-model="ctl00$ContentPlaceHolder1$DepartmentDDL"
            ></CustomSelect>
          </v-col>
        </v-row>

        <v-row class="d-flex align-center">
          <v-col class="text-right" cols="3">日夜間別</v-col>

          <v-col>
            <CustomSelect label="選擇日夜間別" :items="yuntechManager.DATA.dayNight" v-model="ctl00$ContentPlaceHolder1$DayNightDDL"></CustomSelect>
          </v-col>
        </v-row>

        <v-row class="d-flex align-center">
          <v-col class="text-right" cols="3">學制</v-col>

          <v-col>
            <CustomSelect label="選擇學制" :items="yuntechManager.DATA.eduSys" v-model="ctl00$ContentPlaceHolder1$EduSysDDL"></CustomSelect>
          </v-col>
        </v-row>

        <v-row class="d-flex align-center">
          <v-col class="text-right" cols="3">類別</v-col>

          <v-col>
            <CustomSelect label="選擇類別" :items="yuntechManager.DATA.majOp" v-model="ctl00$ContentPlaceHolder1$MajOpDDL"></CustomSelect>
          </v-col>
        </v-row>

        <v-row class="d-flex align-center">
          <v-col class="text-right" cols="3">學期課號</v-col>

          <v-col>
            <v-text-field v-model="ctl00$ContentPlaceHolder1$CurrentSubjTextBox" :label="`填寫學期課號`" maxlength="4" hide-details="auto"></v-text-field>
          </v-col>
        </v-row>

        <v-row class="d-flex align-center">
          <v-col class="text-right" cols="3">課程名稱</v-col>

          <v-col>
            <v-text-field v-model="ctl00$ContentPlaceHolder1$CourseNameTextBox" :label="`填寫課程名稱`" hide-details="auto"></v-text-field>
          </v-col>
        </v-row>

        <v-row class="d-flex align-center">
          <v-col class="text-right" cols="3">授課教師</v-col>

          <v-col>
            <v-text-field v-model="ctl00$ContentPlaceHolder1$TeacherNameTextBox" :label="`填寫授課教師`" hide-details="auto"></v-text-field>
          </v-col>
        </v-row>

        <v-row class="d-flex align-center">
          <v-col class="text-right" cols="3">星期</v-col>

          <v-col class="pa-0">
            <v-checkbox
              class="d-inline-block"
              :label="day"
              value="on"
              v-model="ctl00$ContentPlaceHolder1$WeekCB[index]"
              color="blue"
              hide-details
              v-for="(day, index) in yuntechManager.DATA.days"
              :key="index"
            ></v-checkbox>
          </v-col>
        </v-row>

        <v-row class="d-flex align-center">
          <v-col class="text-right" cols="3">選課時段</v-col>

          <v-col class="pa-0 text-left">
            <v-checkbox
              class="d-inline-block"
              :label="courSession.title"
              :value="courSession.value"
              v-model="ctl00$ContentPlaceHolder1$CourSessionCB[index]"
              color="blue"
              hide-details
              v-for="(courSession, index) in yuntechManager.DATA.courSession"
              :key="index"
            ></v-checkbox>
          </v-col>
        </v-row>

        <v-row class="d-flex align-center">
          <v-col class="text-right" cols="3">跨領域學程</v-col>

          <v-col>
            <CustomSelect label="選擇跨領域學程" :items="yuntechManager.DATA.courProgram" v-model="ctl00$ContentPlaceHolder1$CourProgramDDL"></CustomSelect>
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <v-btn size="large" color="red" @click="clear">
              <v-icon icon="mdi-broom" class="mr-2" />
              <span>清除</span>
            </v-btn>
          </v-col>

          <v-col>
            <v-btn size="large" color="blue" @click="searchCourse" :loading="searchLoading">
              <v-icon icon="mdi-magnify" class="mr-2" />
              <span>搜尋</span>
            </v-btn>
          </v-col>
        </v-row>
      </v-col>

      <v-col>
        <v-table fixed-header>
          <thead>
            <tr>
              <th v-for="header in yuntechManager.courseTable.headers">{{ header.title }}</th>
            </tr>

            <tr v-if="yuntechManager.courseTable.schedule.length === 0">
              <td colspan="50">
                <div class="d-flex align-items-center my-16" style="gap: 40px">
                  <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
                  <v-progress-circular :width="3" color="red" indeterminate></v-progress-circular>
                  <v-progress-circular :size="70" :width="7" color="purple" indeterminate></v-progress-circular>
                  <v-progress-circular :width="3" color="green" indeterminate></v-progress-circular>
                  <v-progress-circular :size="50" color="amber" indeterminate></v-progress-circular>
                </div>
              </td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="schedule in yuntechManager.courseTable.schedule">
              <th class="text-center" :class="schedule.time.class">{{ schedule.time.title }}</th>
              <th class="text-center" :class="schedule.monday.class">{{ schedule.monday.title }}</th>
              <th class="text-center" :class="schedule.tuesday.class">{{ schedule.tuesday.title }}</th>
              <th class="text-center" :class="schedule.wednesday.class">{{ schedule.wednesday.title }}</th>
              <th class="text-center" :class="schedule.thursday.class">{{ schedule.thursday.title }}</th>
              <th class="text-center" :class="schedule.friday.class">{{ schedule.friday.title }}</th>
              <th class="text-center" :class="schedule.saturday.class">{{ schedule.saturday.title }}</th>
              <th class="text-center" :class="schedule.sunday.class">{{ schedule.sunday.title }}</th>
            </tr>
          </tbody>
        </v-table>

        <v-btn class="mt-5" size="large" color="red" @click="registerSelectCourse" v-show="yuntechManager.isShowcheckOrDeleteCourseBtn()">
          <v-icon icon="mdi-arrow-right-thin" class="mr-2" />
          <span>確認或刪除預選課程</span>
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col></v-col>
      <v-col>
        <v-btn size="large" color="green" @click="selectCourse" :loading="selectCourseLoading" :disabled="!yuntechManager.courseList.some((c) => c.select)">
          <v-icon icon="mdi-plus" class="mr-2" />
          <span>登記 / 加進選課清單</span>
        </v-btn>
      </v-col>
    </v-row>

    <v-table fixed-header class="mt-5">
      <thead>
        <tr class="bg-blue">
          <th>✓</th>
          <th>學期課號</th>
          <th>系所課號</th>
          <th>課程名稱</th>
          <th>開課班級</th>
          <th>班別</th>
          <th>班別</th>
          <th>學分組合</th>
          <th>星期 / 節次 / 教室</th>
          <th>授課教師</th>
          <th>修課人數</th>
          <th>人數限制</th>
          <th>備註</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="course in yuntechManager.courseList">
          <th class="px-1">
            <v-checkbox value="on" v-model="course.select" color="blue" hide-details></v-checkbox>
          </th>
          <th>{{ course.currentSubj }}</th>
          <th>{{ course.deptCourNo }}</th>
          <th>{{ course.courseName }}</th>
          <th>{{ course.class }}</th>
          <th>{{ course.subjTeam }}</th>
          <th>{{ course.majOpChn }}</th>
          <th>{{ course.credits }}</th>
          <th>{{ course.classRoom }}</th>
          <th>{{ course.teacher }}</th>
          <th>{{ course.selNo }}</th>
          <th class="text-red">
            <b>{{ course.maxNumber }}</b>
          </th>
          <th>{{ course.courRemark }}</th>
        </tr>
      </tbody>
    </v-table>
  </v-container>

  <CheckCourse />
</template>

<style scoped lang="scss">
*:deep(table) {
  td + td,
  th + th {
    padding: 0 5px !important;
    border-left: 1px solid #454545;
  }

  thead {
    th,
    div,
    td {
      justify-content: center;
      text-align: center !important;
    }
  }

  tbody {
    th {
      &.contentOne {
        background-color: #2196f3;
      }

      &.contentMore {
        background-color: #f44336;
      }

      &.contentNew {
        background-color: #4caf50;
      }

      &.contentBatch {
        background-color: gray;
      }
    }
  }
}

table {
  tr {
    th:nth-child(1) {
      min-width: 50px;
      text-align: center !important;
    }

    th:nth-child(5) {
      white-space: nowrap;
    }
  }
}
</style>
