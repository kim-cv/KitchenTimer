import { Injectable } from '@angular/core';
import { Plugins, FilesystemEncoding, FilesystemDirectory } from '@capacitor/core';
import { Timer } from 'src/app/models/timer/Timer';
import { ITimer } from 'src/app/models/timer/ITimer';

@Injectable({
  providedIn: 'root'
})
export class FilesystemService {

  private readonly keyTimers = 'timers';
  private readonly oldTimersFilename = 'SavedTimings.json';

  constructor() { }

  /**
   * @description Old app used filesystem to store timers
   * This method checks if there is a file with timers.
   * If such file exist, it tries to interpret the data and return an array of old timers
   */
  public async RetrieveTimersFromOldStorage(): Promise<unknown[]> {
    // Check if old file exist
    const doesFileExist = await this.FileExist(this.oldTimersFilename);
    if (doesFileExist === false) {
      // File does not exist, which is ok sine we're moving away from filesystem to local storage API
      return [];
    }

    // Read file data
    const file = await this.ReadFile(this.oldTimersFilename);

    // Try read as json
    let fileAsJsonObj;
    try {
      fileAsJsonObj = JSON.parse(file.data);
    } catch (e) {
      // throw new Error('Could not parse file data as json');
      return [];
    }

    // Make sure JSON.parse succeded
    if (typeof fileAsJsonObj === undefined || fileAsJsonObj === null) {
      // throw new Error('JSON_NO_CONTENT');
      return [];
    }

    // Check if array of entries or just single entry
    let tmpArray = [];
    if (Array.isArray(fileAsJsonObj)) {
      tmpArray = fileAsJsonObj;
    } else {
      tmpArray.push(fileAsJsonObj);
    }

    return tmpArray;
  }

  // #region Filesystem
  /**
   * Read file from path
   */
  private async ReadFile(path: string) {
    return Plugins.Filesystem.readFile(
      {
        path,
        directory: FilesystemDirectory.Application,
        encoding: FilesystemEncoding.UTF8
      });
  }

  /**
   * Check if file exist
   */
  private async FileExist(path: string): Promise<boolean> {
    try {
      await this.ReadFile(path);
      return true;
    } catch (err) {
      console.error('FileExist()', err);
      return false;
    }
  }
  // #endregion

  /**
   * Retrieves timers from storage
   * @returns JSON Array of timer objects
   */
  public async LoadTimers(): Promise<ITimer[]> {
    const timers = await Plugins.Storage.get({ key: this.keyTimers });

    if (typeof timers.value === 'undefined' || timers.value === null) {
      return [];
    }

    const parsedValue: ITimer[] = JSON.parse(timers.value);
    return parsedValue;
  }

  public SaveTimers(timers: Timer[]) {
    return Plugins.Storage.set({
      key: this.keyTimers,
      value: JSON.stringify(timers)
    });
  }
}
