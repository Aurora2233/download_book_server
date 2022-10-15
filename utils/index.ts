import type { AxiosRequestConfig } from 'axios';
import { get, post } from './request';

type ResponseDataType = <T>(
  url: string,
  params?: Record<string, unknown>,
  config?: AxiosRequestConfig
) => Promise<T>;

export interface Utils {
  get: ResponseDataType;
  post: ResponseDataType;
  log: (value: unknown) => void;
}

const log = (value: unknown) => {
  console.log(value);
};

export default {
  get,
  post,
  log,
};
