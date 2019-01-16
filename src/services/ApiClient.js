// @flow
import axios, { type Axios, type AxiosPromise } from 'axios';
import qs from 'qs';
import { AsyncStorage } from 'react-native';
import JsSHA from 'jssha';

import { DEFAULT_CURRENCY, DEFAULT_LOCALE } from '../localization/helpers';
import { getConfig } from './config';
import type { Currency, Locale } from '../types';

let instance = null;
const API_BASE_URL = getConfig('API_BASE_URL');
const API_SECRET_KEY = getConfig('API_SECRET_KEY');

export class ApiClient {
  axios: Axios;
  baseURL: string;
  accessToken: ?string;
  instance: ?Object;

  static STORAGE_KEY = 'ACCESS_TOKEN';

  constructor(baseURL: string) {
    if (!instance) {
      instance = this;
    }

    this.baseURL = baseURL;
    this.axios = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'X-Lang': DEFAULT_LOCALE,
        'X-Currency': DEFAULT_CURRENCY,
      },
      // use "?a=b&a=c&a=d" instead of "?a[]=b&a[]=c&a[]=d"
      paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' }),
    });
    return instance;
  }

  async post(path: string, data: Array<any> | Object, config?: Object = {}): AxiosPromise<Object> {
    return this.axios.post(path, data, config);
  }

  async get(path: string, config?: Object): AxiosPromise<*> {
    return this.axios.get(path, config);
  }

  async getAuth(path: string, config?: Object): AxiosPromise<Object> {
    const headers = this.getAuthHeader();
    return this.axios.get(path, { headers, withCredentials: true, ...config });
  }

  async deleteAuth(
    path: string,
    data?: Array<any> | Object,
    config?: Object = {},
  ): AxiosPromise<Object> {
    const headers = this.getAuthHeader();
    return this.axios.delete(path, { data, headers, withCredentials: true, ...config });
  }

  async postAuth(
    path: string,
    data?: Array<any> | Object,
    config?: Object = {},
  ): AxiosPromise<Object> {
    const headers = this.getAuthHeader();
    return this.axios.post(path, data, { headers, withCredentials: true, ...config });
  }

  async putAuth(
    path: string,
    data?: Array<any> | Object,
    config?: Object = {},
  ): AxiosPromise<Object> {
    const headers = this.getAuthHeader();
    return this.axios.put(path, data, { headers, withCredentials: true, ...config });
  }

  async postSecure(
    path: string,
    data: Array<any> | Object,
    config?: Object = {},
  ): AxiosPromise<Object> {
    const headers = ApiClient.getBodyHash(data);
    return this.axios.post(path, data, { headers, ...config });
  }

  getAuthHeader(): Object {
    return this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {};
  }

  async loadAccessToken() {
    const token = await AsyncStorage.getItem(ApiClient.STORAGE_KEY);
    this.accessToken = token;
    return token;
  }

  setAccessToken(token: string) {
    this.accessToken = token;
    return AsyncStorage.setItem(ApiClient.STORAGE_KEY, token);
  }

  deleteAccessToken() {
    this.accessToken = null;
    return AsyncStorage.removeItem(ApiClient.STORAGE_KEY);
  }

  setCurrency(currency: Currency) {
    this.axios.defaults.headers['X-Currency'] = currency;
  }

  setLocale(locale: Locale) {
    this.axios.defaults.headers['X-Lang'] = locale;
  }

  static getBodyHash = (data: Object | Array<any>): Object => {
    const shaObj = new JsSHA('SHA3-512', 'TEXT');
    shaObj.setHMACKey(API_SECRET_KEY, 'TEXT');
    shaObj.update(JSON.stringify(data));
    return {
      'X-BODY-HASH': shaObj.getHMAC('HEX'),
    };
  };
}

export default new ApiClient(API_BASE_URL);
