import { registerLocaleData } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { filter, map, startWith } from 'rxjs/operators';
import { LANGUAGES } from '../constants/generic.constants';

export class DynamicLocaleId extends String {

  constructor(
    protected translate: TranslateService
  ) {
    super('');

    this.translate.onLangChange.pipe(
      map(({ lang }) => lang as string),
      startWith(this.translate.currentLang as string),
      filter<string>(Boolean)
    ).subscribe(async (lang: string) => {
      if(!Object.keys(LANGUAGES || {})?.includes(lang)){
        Promise.reject('Locale not supported');
        return
      }

      const selectedLocale = {
        // en: await import(`@angular/common/locales/en`)
        es: await import(`@angular/common/locales/es`)
      }?.[lang];

      registerLocaleData(selectedLocale!.default)
    });
  }

  override toString() {
    return this.translate.currentLang;
  }


}
