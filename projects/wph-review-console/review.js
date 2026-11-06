import {records,validateDecision} from '../wph-discovery/fixtures.js';
const select=document.getElementById('review-record');
for(const record of records){const option=document.createElement('option');option.value=record.id;option.textContent=record.title;select.append(option)}
