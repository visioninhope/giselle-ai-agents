export type LogFn = {
	(obj: Record<string, any>, msg?: string, ...args: any[]): void;
	(msg: string, ...args: any[]): void;
};

export interface GiselleLogger {
	info: LogFn;
	warn: LogFn;
	error: LogFn;
	debug: LogFn;
	trace: LogFn;
	fatal: LogFn;
	child(bindings: Record<string, any>): GiselleLogger;
}
