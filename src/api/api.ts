import * as Application from 'expo-application';
import { Song } from './song';

const USER_AGENT = `${Application.applicationId}/${Application.nativeApplicationVersion} (made with <3)`;

export class APIUnauthorizedError extends Error {
  constructor() {
    super('Unauthorized');
  }
}

export default class API {
  private readonly url: string;
  constructor(url: string, private token: string) {
    this.url = url.endsWith('/') ? url : url + '/';
  }

  public getURL() {
    return this.url;
  }

  public getToken() {
    return this.token;
  }

  private checkStatus(res: Response) {
    if (res.status === 401) {
      throw new APIUnauthorizedError();
    }

    if (!res.ok) {
      throw new Error('Invalid response status: ' + res.status);
    }
  }

  private request(url: string, options?: RequestInit) {
    options ??= {};
    let headers = (options.headers as Record<string, string>) ?? {};
    headers['authorization'] = 'Bearer ' + this.token;
    headers['user-agent'] = USER_AGENT;

    options.headers = headers;

    return fetch(url, options);
  }

  async verifySession() {
    const res = await this.request(`${this.url}api/v1/me`);
    return res.ok;
  }

  async fetchImageBase64(url: string) {
    const res = await this.request(url);
    const blob = await res.blob();
    return await new Promise<string | null>((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(blob);
      fileReader.onload = () => {
        resolve(fileReader.result?.toString() ?? null);
      };
      fileReader.onerror = err => {
        reject(err);
      };
    });
  }

  async getSongs(): Promise<Song[]> {
    const res = await this.request(`${this.url}api/v1/songs`);
    this.checkStatus(res);
    const json = await res.json();
    return json['results'];
  }

  static async verifyToken(url: string, token: string) {
    const res = await fetch(`${url}api/v1/me`, {
      method: 'GET',
      headers: {
        authorization: 'Bearer ' + token,
        'user-agent': USER_AGENT
      }
    });

    return res.ok;
  }

  async getSongMedia(songId: number) {
    const res = await this.request(`${this.url}api/v1/songs/${songId}/media`);
    this.checkStatus(res);
    const json = await res.json();
    return json['results'];
  }
}
