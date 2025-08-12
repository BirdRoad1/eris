import * as Application from 'expo-application';
import { Song } from './song';
import * as FileSystem from 'expo-file-system';
import { Artist } from './artist';

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

  private async checkStatus(res: Response) {
    if (res.status === 401) {
      throw new APIUnauthorizedError();
    }

    if (!res.ok) {
      const json = await res.json();

      throw new Error(json.error ?? 'Bad HTTP code: ' + res.status);
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
    await this.checkStatus(res);
    const json = await res.json();
    return json['results'];
  }

  async getArtists(): Promise<Artist[]> {
    const res = await this.request(`${this.url}api/v1/artists`);
    await this.checkStatus(res);
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
    await this.checkStatus(res);
    const json = await res.json();
    return json['results'];
  }

  async createSong(title: string, artistId?: number, albumId?: number) {
    const res = await this.request(`${this.url}api/v1/songs`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({ title, artistId, albumId })
    });

    await this.checkStatus(res);

    return await res.json();
  }

  async deleteSong(id: number) {
    const res = await this.request(`${this.url}api/v1/songs/${id}`, {
      method: 'DELETE'
    });

    await this.checkStatus(res);
  }

  async uploadAsset(
    id: number,
    fileUri: string,
    entity: 'songs' | 'artists' | 'albums',
    fileName: string,
    type: 'media' | 'cover'
  ) {
    const result = await FileSystem.uploadAsync(
      `${this.url}api/v1/${entity}/${id}/${type}`,
      fileUri,
      {
        httpMethod: 'POST',
        headers: {
          authorization: `Bearer ${this.token}`,
          'file-name': fileName
        }
      }
    );

    if (result.status === 401) {
      throw new APIUnauthorizedError();
    }

    if (result.status !== 200) {
      let err: string;
      try {
        err = JSON.parse(result.body).error;
      } catch {}
      err ??= 'Bad HTTP code: ' + result.status;

      throw new Error(err);
    }
  }

  async createArtist(name: string) {
    const res = await this.request(`${this.url}api/v1/artists`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({ name })
    });

    await this.checkStatus(res);

    return await res.json();
  }

  async deleteArtist(id: number) {
    const res = await this.request(`${this.url}api/v1/artists/${id}`, {
      method: 'DELETE'
    });

    await this.checkStatus(res);
  }

  async searchArtist(name: string) {
    const res = await this.request(
      `${this.url}api/v1/artists/search?name=${name}`,
      {
        method: 'GET'
      }
    );

    await this.checkStatus(res);

    return (await res.json()).results;
  }

  async getAlbums() {
    const res = await this.request(`${this.url}api/v1/albums`);
    await this.checkStatus(res);
    const json = await res.json();
    return json['results'];
  }

  async createAlbum(
    name: string,
    artistIds: number[],
    genre?: string,
    release_year?: number
  ) {
    const res = await this.request(`${this.url}api/v1/albums`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({ name, artistIds, genre, release_year })
    });

    await this.checkStatus(res);

    return await res.json();
  }

  async searchAlbums(name: string) {
    const res = await this.request(
      `${this.url}api/v1/albums/search?name=${name}`,
      {
        method: 'GET'
      }
    );

    await this.checkStatus(res);

    return (await res.json()).results;
  }

  async deleteAlbum(id: number) {
    const res = await this.request(`${this.url}api/v1/albums/${id}`, {
      method: 'DELETE'
    });

    await this.checkStatus(res);
  }
}
