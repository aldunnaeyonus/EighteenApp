export const preset = "jest-expo";
export const setupFilesAfterEnv = ["@testing-library/jest-native/extend-expect"];
export const transform = {
    "^.+\\.(js|ts|tsx)$": "babel-jest",
};
export const moduleNameMapper = {
    "\\.(png|jpg|jpeg|gif|svg)$": "<rootDir>/__mocks__/fileMock.js",
};