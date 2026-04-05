const keys = {};
const pressedKeys = {};
const typedKeyBuffer = [];
const maxTypedKeyBufferLength = 20;

function normalizeKey(key) {
	return key.length === 1 ? key.toLowerCase() : key;
}

function consumeKeyPress(key) {
	const normalizedKey = normalizeKey(key);
	const wasPressed = !!pressedKeys[normalizedKey];
	pressedKeys[normalizedKey] = false;
	return wasPressed;
}

function consumeTypedCode(code) {
	const normalizedCode = code.toLowerCase();
	const currentBuffer = typedKeyBuffer.join("");

	if (!currentBuffer.endsWith(normalizedCode)) {
		return false;
	}

	typedKeyBuffer.length = 0;
	return true;
}

document.addEventListener("keydown", e => {
	const key = normalizeKey(e.key);

	if (!keys[key]) {
		pressedKeys[key] = true;

		if (key.length === 1 && /[a-z]/.test(key)) {
			typedKeyBuffer.push(key);
			if (typedKeyBuffer.length > maxTypedKeyBufferLength) {
				typedKeyBuffer.shift();
			}
		}
	}

	keys[key] = true;
});

document.addEventListener("keyup", e => {
	const key = normalizeKey(e.key);
	keys[key] = false;
});