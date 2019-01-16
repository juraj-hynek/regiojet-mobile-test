// flow-typed signature: abef894b640437e8b1194385eed42093
// flow-typed version: f79b6d4828/react-native-communications_v2.2.x/flow_>=v0.25.x

// @flow

type zeroArgumentEmail = () => void
type oneArgumentEmail = (to: Array<string>) => void
type fiveArgumentEmail = (to: Array<string>, cc: Array<string>, bcc: Array<string>, subject: string, body: string) => void

declare module 'react-native-communications' {
  declare module.exports: {
      phonecall: (phoneNumber: string, prompt: boolean) => void,
      email: & zeroArgumentEmail & oneArgumentEmail & fiveArgumentEmail,
      text: (phoneNumber?: string, body?: string) => void,
      textWithoutEncoding: (phoneNumber?: string, body?: string) => void,
      web: (address: string) => void,
  }
}
