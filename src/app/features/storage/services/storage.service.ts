import { Injectable } from '@angular/core';
import { Preferences  } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class StorageService {


  constructor() { }


  async loadVerses(key: string) {
    const verse = await Preferences.get({key})
    return await JSON.parse(verse?.value!) || [];
  }

  async saveVerse(key: string, verse: string | any[]) {
    await Preferences.set({key, value: JSON.stringify(verse)})
  }

}
