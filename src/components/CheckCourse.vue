<script setup lang="ts">
import { ref } from 'vue';
import { useYuntechStore } from '../stores/Yuntech.js';
import { snackbarShow, SnackbarStatus } from '../modules/Utils.js';

const yuntechManager = useYuntechStore();
const deleteLoading = ref(false);
const preStepLoading = ref(false);
const sendLoading = ref(false);

const setBtnLoading = (val = true) => {
  deleteLoading.value = val;
  preStepLoading.value = val;
  sendLoading.value = val;
};

const checkDelete = async () => {
  try {
    setBtnLoading();
    const data: Record<string, string> = {};
    yuntechManager.courseCheckTable.schedule.forEach((course, index) => {
      if (!course.select) return;

      data[`ctl00$ContentPlaceHolder1$CourseCheckListGridView$ctl${(index + 2).toString().padStart(2, '0')}$SelectCheckBox`] = 'on';
    });

    await yuntechManager.checkDelete(data);
  } catch (error) {
    snackbarShow(`${error}`, SnackbarStatus.Error);
  } finally {
    setBtnLoading(false);
  }
};

const checkPreStep = async () => {
  try {
    setBtnLoading();
    await yuntechManager.checkPreStep();
  } catch (error) {
    snackbarShow(`${error}`, SnackbarStatus.Error);
  } finally {
    setBtnLoading(false);
  }
};

const checkSend = async () => {
  try {
    setBtnLoading();
    await yuntechManager.checkSend();
  } catch (error) {
    snackbarShow(`${error}`, SnackbarStatus.Error);
  } finally {
    setBtnLoading(false);
  }
};
</script>

<template>
  <template>
    <v-row justify="center">
      <v-dialog v-model="yuntechManager.showCheckResiterCourseDialog" persistent width="auto">
        <v-card>
          <v-card-title class="text-h4 ma-5 card-title"> 確認預選課程 </v-card-title>

          <v-table fixed-header class="mx-5 mt-3">
            <thead>
              <tr>
                <th v-for="header in yuntechManager.courseCheckTable.headers">{{ header.title }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="schedule in yuntechManager.courseCheckTable.schedule">
                <th class="text-center">
                  <v-checkbox value="on" v-model="schedule.select" color="blue" hide-details></v-checkbox>
                </th>
                <th class="text-center">{{ schedule.currentSubj }}</th>
                <th class="text-center">{{ schedule.deptCourNo }}</th>
                <th class="text-center">{{ schedule.courseName }}</th>
                <th class="text-center">{{ schedule.teacher }}</th>
                <th class="text-center">{{ schedule.selNo }}</th>
                <th class="text-center">{{ schedule.maxNumber }}</th>
                <th class="text-center">{{ schedule.courRemark }}</th>
                <th class="text-center" v-html="schedule.courseStatus"></th>
              </tr>
            </tbody>
          </v-table>

          <v-row class="text-center my-2">
            <v-col>
              <v-btn
                size="large"
                color="red"
                :loading="deleteLoading"
                :disabled="!yuntechManager.courseCheckTable.schedule.some((c) => c.select)"
                @click="checkDelete"
              >
                <v-icon icon="mdi-trash-can" class="mr-2" />
                <span>刪除</span>
              </v-btn>
            </v-col>

            <v-col>
              <v-btn size="large" color="blue" :loading="preStepLoading" @click="checkPreStep">
                <v-icon icon="mdi-arrow-left-thin" class="mr-2" />
                <span>上一步</span>
              </v-btn>
            </v-col>

            <v-col>
              <v-btn size="large" color="green" :loading="sendLoading" @click="checkSend" :disabled="!yuntechManager.courseCheckTable.btn.showNextBtn">
                <v-icon icon="mdi-arrow-right-thin" class="mr-2" />
                <span>送出</span>
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-dialog>
    </v-row>
  </template>
</template>

<style scoped lang="scss">
*:deep(table) {
  td + td,
  th + th {
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
}

.card-title {
  border-bottom: 1px solid #2196f3;
}
</style>
