export type Action = (...args: unknown[]) => void;
export type Action1<A1> = (arg1: A1) => void;

export type ActionMaybeAsync = (...args: unknown[]) => void | Promise<void>;
export type ActionMaybeAsync1<A1> = (arg1: A1) => void | Promise<void>;
