precision highp float;

uniform sampler2D chars;
uniform vec2 charsShape;
uniform float charsStep, pixelRatio, charOffset;

varying vec4 borderColor;
varying vec4 charColor;
varying vec2 charId;
varying vec2 pointCoord;
varying float pointSize;
varying float borderWidth;

void main() {
	vec2 pointUV = (pointCoord - gl_FragCoord.xy + pointSize * .5) / pointSize;
	pointUV.x = 1. - pointUV.x;
	pointUV.y += charOffset;
	vec2 texCoord = ((charId + pointUV) * charsStep) / charsShape;
	float dist = texture2D(chars, texCoord).r;

	//max-distance alpha
	if (dist < 1e-2)
		discard;

	float dif = 6. * pixelRatio * borderWidth / pointSize;
	float borderLevel = .746 - dif * .6;
	float charLevel = .746 + dif * .4;
	float gamma = .0045 * charsStep / pointSize;

	float borderAmt = smoothstep(borderLevel - gamma, borderLevel + gamma, dist);
	float charAmt = smoothstep(charLevel - gamma, charLevel + gamma, dist);

	vec4 color = borderColor;
	color.a *= borderAmt;

	gl_FragColor = mix(color, charColor, charAmt);
}
