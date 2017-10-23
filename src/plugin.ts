import * as io from "socket.io-client";
import * as m from "mithril";

export class EmitterPlugin {
	socket: any;
	id: string;
	token: string;

	load(params: any, previousController: any) {
		this.socket = io(params.url);

		return new Promise((resolve, reject): void => {
			this.socket.on('controllersAllowed', (emitterAttributes: any) => {
				this.buildControllers(previousController, emitterAttributes);
				resolve();
			});
		});
	}

	run(params: any = {}) {
		if (!params.headers) params.headers = {};

		params.headers["pyrite-token"] = this.token;

		if (params && params.emit) {
			const emitTo =  Array.isArray(params.emit) ? params.emit.join('|') : params.emit;
			params.headers["pyrite-id"] = emitTo;
		}
	}

	private buildControllers(previousController: any, emitterAttributes: any): void {
		this.id = emitterAttributes.id;
		this.token = emitterAttributes.token;

		const controllerNames: Array<string> = Object.keys(emitterAttributes.controllers);

		controllerNames.forEach((controllerName: string): void => {
			const methods: Array<string> = emitterAttributes.controllers[controllerName];

			methods.forEach((methodName: string): void => {
				previousController.controllers[controllerName].emits = true;

				this.createOnEvent(previousController.controllers[controllerName], controllerName, methodName);
			});
		});
	}

	private createOnEvent(controller: any, controllerName: string, methodName: string) {
		if (!controller.on) controller.on = {};
		if (!controller.off) controller.off = {};

		const eventName: string = controllerName + ".on." + methodName;

		let callback: Function = (): any => {};

		const listener: Function = (response: any): void => {
			const redraw = { background: false };

			callback(response.data, response.id, redraw);

			if (!redraw.background) m.redraw();
		};

		controller.on[methodName] = (emitCallback: Function): void => {
			callback = emitCallback;
			this.socket.on(eventName, listener);
		};

		controller.off[methodName] = (): void => {
			this.socket.removeListener(eventName, listener);
		};
	}
}
