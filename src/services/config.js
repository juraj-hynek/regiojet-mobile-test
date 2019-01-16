// @flow

/*
!!! READ !!!
- config variables are read from env variables or .env file (see .env-sample)
- this is done using `babel-plugin-dotenv-import`
- there is one caveat to this (see https://github.com/tusbar/babel-plugin-dotenv-import#caveats) - if you change a variable, you will see no change in code
  => you need to change something in THIS file (e.g. add a new line, add a comment...)
     and save it to see changed variables
*/

// $FlowFixMe
import { API_BASE_URL, API_SECRET_KEY, GOOGLE_MAP_API_KEY, GTM_ID } from '@env'; // eslint-disable-line import/no-unresolved, import/extensions

const configVariables = {
  API_BASE_URL,
  API_SECRET_KEY,
  GOOGLE_MAP_API_KEY,
  GTM_ID,
};

export type ConfigType = $Keys<typeof configVariables>;

export const getConfig = (key: ConfigType, defaultValue: ?string = null) => {
  const value = configVariables[key] || defaultValue;

  if (!value) {
    throw new Error(
      `Config variable "${key}" not found in env variables and no default value was provided.`,
    );
  }

  return value;
};
