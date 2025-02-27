import type {
	BrowserExecutable,
	ChromiumOptions,
	FrameRange,
	LogLevel,
} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import {ConfigInternals} from './config';
import {getEnvironmentVariables} from './get-env';
import {getInputProps} from './get-input-props';
import {Log} from './log';

const getAndValidateFrameRange = () => {
	const frameRange = ConfigInternals.getRange();
	if (typeof frameRange === 'number') {
		Log.warn('Selected a single frame. Assuming you want to output an image.');
		Log.warn(
			`If you want to render a video, pass a range:  '--frames=${frameRange}-${frameRange}'.`,
		);
		Log.warn("To dismiss this message, add the '--sequence' flag explicitly.");
	}

	return frameRange;
};

const getBrowser = () =>
	ConfigInternals.getBrowser() ?? RenderInternals.DEFAULT_BROWSER;

export const getAndValidateAbsoluteOutputFile = (
	relativeOutputLocation: string,
	overwrite: boolean,
) => {
	const absoluteOutputFile = path.resolve(
		process.cwd(),
		relativeOutputLocation,
	);
	if (fs.existsSync(absoluteOutputFile) && !overwrite) {
		Log.error(
			`File at ${absoluteOutputFile} already exists. Use --overwrite to overwrite.`,
		);
		process.exit(1);
	}

	return absoluteOutputFile;
};

const getAndValidateShouldOutputImageSequence = ({
	frameRange,
}: {
	frameRange: FrameRange | null;
}) => {
	const shouldOutputImageSequence =
		ConfigInternals.getShouldOutputImageSequence(frameRange);

	return shouldOutputImageSequence;
};

const getCrf = (shouldOutputImageSequence: boolean) => {
	const crf = shouldOutputImageSequence
		? null
		: ConfigInternals.getCrfOrUndefined();

	return crf;
};

const getProResProfile = () => {
	const proResProfile = ConfigInternals.getProResProfile();

	return proResProfile;
};

const getx264Preset = () => {
	const x264Preset = ConfigInternals.getPresetProfile();

	return x264Preset;
};

const getAndValidateBrowser = async ({
	browserExecutable,
	indent,
	logLevel,
}: {
	browserExecutable: BrowserExecutable;
	indent: boolean;
	logLevel: LogLevel;
}) => {
	const browser = getBrowser();
	try {
		await RenderInternals.ensureLocalBrowser({
			preferredBrowserExecutable: browserExecutable,
			indent,
			logLevel,
		});
	} catch (err) {
		Log.error('Could not download a browser for rendering frames.');
		Log.error(err);
		process.exit(1);
	}

	return browser;
};

export const getCliOptions = async (options: {
	isLambda: boolean;
	type: 'still' | 'series' | 'get-compositions';
	remotionRoot: string;
}) => {
	const frameRange = getAndValidateFrameRange();

	const shouldOutputImageSequence =
		options.type === 'still'
			? true
			: getAndValidateShouldOutputImageSequence({
					frameRange,
			  });

	const overwrite = ConfigInternals.getShouldOverwrite({
		defaultValue: !options.isLambda,
	});
	const crf = getCrf(shouldOutputImageSequence);
	const videoBitrate = ConfigInternals.getVideoBitrate();

	const pixelFormat = ConfigInternals.getPixelFormat();
	const proResProfile = getProResProfile();
	const x264Preset = getx264Preset();
	const browserExecutable = ConfigInternals.getBrowserExecutable();
	const scale = ConfigInternals.getScale();
	const port = ConfigInternals.getServerPort();

	const chromiumOptions: ChromiumOptions = {
		disableWebSecurity: ConfigInternals.getChromiumDisableWebSecurity(),
		ignoreCertificateErrors: ConfigInternals.getIgnoreCertificateErrors(),
		headless: ConfigInternals.getChromiumHeadlessMode(),
		gl:
			ConfigInternals.getChromiumOpenGlRenderer() ??
			RenderInternals.DEFAULT_OPENGL_RENDERER,
		userAgent: ConfigInternals.getChromiumUserAgent(),
		enableMultiProcessOnLinux: ConfigInternals.getChromiumMultiProcessOnLinux(),
	};
	const everyNthFrame = ConfigInternals.getEveryNthFrame();
	const numberOfGifLoops = ConfigInternals.getNumberOfGifLoops();

	const concurrency = ConfigInternals.getConcurrency();

	const height = ConfigInternals.getHeight();
	const width = ConfigInternals.getWidth();

	RenderInternals.validateConcurrency({
		value: concurrency,
		setting: 'concurrency',
		checkIfValidForCurrentMachine: false,
	});

	const logLevel = ConfigInternals.Logging.getLogLevel();

	return {
		puppeteerTimeout: ConfigInternals.getCurrentPuppeteerTimeout(),
		concurrency,
		frameRange,
		shouldOutputImageSequence,
		inputProps: getInputProps(null),
		envVariables: await getEnvironmentVariables(null),
		jpegQuality: ConfigInternals.getJpegQuality(),
		browser: await getAndValidateBrowser({
			browserExecutable,
			indent: false,
			logLevel,
		}),
		crf,
		pixelFormat,
		proResProfile,
		x264Preset,
		everyNthFrame,
		numberOfGifLoops,
		stillFrame: ConfigInternals.getStillFrame(),
		browserExecutable,
		logLevel: ConfigInternals.Logging.getLogLevel(),
		scale,
		chromiumOptions,
		overwrite,
		port: port ?? null,
		muted: ConfigInternals.getMuted(),
		enforceAudioTrack: ConfigInternals.getEnforceAudioTrack(),
		publicDir: ConfigInternals.getPublicDir(),
		ffmpegOverride: ConfigInternals.getFfmpegOverrideFunction(),
		audioBitrate: ConfigInternals.getAudioBitrate(),
		videoBitrate,
		height,
		width,
		configFileImageFormat: ConfigInternals.getUserPreferredVideoImageFormat(),
		offthreadVideoCacheSizeInBytes:
			ConfigInternals.getOffthreadVideoCacheSizeInBytes(),
		deleteAfter: ConfigInternals.getDeleteAfter(),
		colorSpace: ConfigInternals.getColorSpace(),
	};
};
