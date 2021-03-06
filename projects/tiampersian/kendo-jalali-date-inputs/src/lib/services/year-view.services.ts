import { Inject, Injectable } from '@angular/core';
import { YearViewService } from '@progress/kendo-angular-dateinputs';
import { CldrIntlService, IntlService } from '@progress/kendo-angular-intl';
import { addMonths } from '@progress/kendo-date-math';
import moment from 'jalali-moment';
import { JalaliCldrIntlService } from './locale.service';
import { EMPTY_SELECTIONRANGE, getToday, isInSelectionRange, range } from './utils';


const EMPTY_DATA = [[]];

@Injectable()
export class JalaliYearViewService extends YearViewService {
  constructor(
    @Inject(IntlService) protected intlService: JalaliCldrIntlService
  ) {
    super(intlService);
  }

  abbrMonthNames2() {
    if (this.intlService.isJalali) {
      return moment().locale(this.intlService.localeId).localeData().jMonthsShort();
    }
    return moment().locale(this.intlService.localeId).localeData().monthsShort();
  }

  data(options) {
    const { cellUID, focusedDate, isActiveView, max, min, selectedDate, selectionRange = EMPTY_SELECTIONRANGE, viewDate } = options;
    if (!viewDate) {
      return EMPTY_DATA;
    }

    const months = this.abbrMonthNames2();
    const isSelectedDateInRange = moment(selectedDate).isBetween(min, max);
    //firstMonthOfYear
    const firstDate = moment(viewDate).locale(this.intlService.localeIdByDatePickerType).startOf('year').add(moment(viewDate).locale(this.intlService.localeIdByDatePickerType).date() - 1, 'day').toDate();
    const lastDate = moment(viewDate).locale(this.intlService.localeIdByDatePickerType).endOf('year').add(-1, 'month').add(moment(viewDate).locale(this.intlService.localeIdByDatePickerType).date(), 'day').toDate();
    // const firstDate = moment(viewDate).locale('fa').startOf('month').toDate();
    // const lastDate = moment(viewDate).locale('fa').endOf('month').toDate();
    const currentYear = moment(firstDate).locale(this.intlService.localeIdByDatePickerType).year();
    const cells = range(0, 5);
    const today = getToday();
    const xxx = range(0, 3).map(rowOffset => {
      const baseDate = addMonths(firstDate, rowOffset * 5);
      return cells.map(cellOffset => {
        const cellDate = this['normalize'](addMonths(baseDate, cellOffset), min, max);
        const changedYear = currentYear < moment(cellDate).locale(this.intlService.localeIdByDatePickerType).year();
        if (!moment(cellDate).isBetween(min, max)) {
          return null;
        }
        if (changedYear) {
          return null;
        }
        const isRangeStart = this.isEqual(cellDate, selectionRange.start);
        const isRangeEnd = this.isEqual(cellDate, selectionRange.end);
        const isInMiddle = !isRangeStart && !isRangeEnd;
        const isRangeMid = isInMiddle && isInSelectionRange(cellDate, selectionRange);
        return {
          formattedValue: months[moment(cellDate).locale(this.intlService.localeIdByDatePickerType).month()],
          id: `${cellUID}${cellDate.getTime()}`,
          isFocused: this.isEqual(cellDate, focusedDate),
          isSelected: isActiveView && isSelectedDateInRange && this.isEqual(cellDate, selectedDate),
          isWeekend: false,
          isRangeStart,
          isRangeMid,
          isRangeEnd,
          isRangeSplitEnd: isRangeMid && this.isEqual(cellDate, lastDate),
          isRangeSplitStart: isRangeMid && this.isEqual(cellDate, firstDate),
          isToday: this.isEqual(cellDate, today),
          title: this.cellTitle(cellDate),
          value: cellDate
        };
      });
    });

    return xxx;
  }
  title(current) {
    return `${moment(current).locale(this.intlService.localeIdByDatePickerType).format('YYYY')}`;
  }
  navigationTitle(value) {
    return `${moment(value).locale(this.intlService.localeIdByDatePickerType).format('YYYY')}`;

  }
}


