import { HttpHeaders } from "@angular/common/http";

export const APP_LANG_KEY = 'GodsWordLang';

export const LAST_VERSE_STORAGE_KEY = 'GodsWordLastVerse';

export const SAVED_VERSE_STORAGE_KEY = 'GodsWordSaveVerse';

export const DEFAULT_LANG = 'es';

export const LANGUAGES = {
  es:'es'
};

export const ERROR_IMAGE = 'assets/images/error.png';

export const NO_DATA_IMAGE = 'assets/images/empty.png';

export const SEARCH_IMAGE = 'assets/images/buscar.png';

export const HEADERS = new HttpHeaders({
  'Accept-Language': 'es',
});

export const SHARED_WEB_URL = 'https://www.biblegateway.com/passage/?search=VERSE&version=RVR1960'

export const MAIL_TO_EMAIL = 'mailto:crislaez30@gmail.com?';

export const TWITTER_URL = 'https://twitter.com/crislaez';

export const GITHUB_URL = 'https://github.com/crislaez';
