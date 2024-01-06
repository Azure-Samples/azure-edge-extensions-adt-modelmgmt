export interface Component {
  '@type': string,
  schema: string,
}

export interface Model {
  '@id': string,
  '@type': string,
  '@context': string,
  extends?: string | string[],
  contents?: Component[],
}
