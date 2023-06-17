/*
 * @Autor: huasenjio
 * @Date: 2022-10-22 10:49:51
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-19 15:16:30
 * @Description:
 */

import Mock from 'mockjs2';
import { get, post } from '../request.js';

const findJournal = post('/journal/findAll');
const findJournalInformationById = post('/journal/findJournalInformationById');

export default {
  findJournal,
  findJournalInformationById,
};
