export function createBus(eventTarget) {
	function send(messageType, payload) {
		eventTarget.dispatchEvent(new CustomEvent('@' + messageType, {detail: payload}))
	}

	function on(messageType, listener) {
		eventTarget.addEventListener('@' + messageType, function (ev) {
			listener(ev.detail)
		})
	}

	return {
		send,
		on,
	}
}