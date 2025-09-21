declare module './msw' {
  export type SetupMswOptions = {
    mockPath?: string;
    onStart?: () => void;
  };
  export function setupMsw(opts?: SetupMswOptions): Promise<void>;
  export default setupMsw;
}
