import {CliInternals} from '@remotion/cli';
import type {BrowserSafeApis} from '@remotion/renderer/client';
import type {DeleteAfter} from '../client';

import type {AwsRegion} from '../pricing/aws-regions';
import type {Privacy} from '../shared/constants';

type LambdaCommandLineOptions = {
	help: boolean;
	region: AwsRegion;
	memory: number;
	disk: number;
	timeout: number;
	['retention-period']: number;
	y: boolean;
	yes: boolean;
	force: boolean;
	f: boolean;
	['default-only']: boolean;

	['site-name']: string | undefined;
	['disable-chunk-optimization']: boolean;
	['save-browser-logs']: boolean;
	['disable-cloudwatch']: boolean;
	['max-retries']?: number;
	['frames-per-lambda']?: number;
	['concurrency-per-lambda']?: number;
	['out-name']: string | undefined;
	['custom-role-arn']: string | undefined;
	privacy: Privacy;
	webhook: string | undefined;
	['webhook-secret']: string | undefined;
	[BrowserSafeApis.options.webhookCustomDataOption.cliFlag]: string | undefined;
	['renderer-function-name']: string | undefined;
	['function-name']: string | undefined;
	['force-bucket-name']: string | undefined;
	[BrowserSafeApis.options.deleteAfterOption.cliFlag]: DeleteAfter | undefined;
	[BrowserSafeApis.options.folderExpiryOption.cliFlag]: boolean | undefined;
};

export const parsedLambdaCli = CliInternals.minimist<LambdaCommandLineOptions>(
	process.argv.slice(2),
	{
		boolean: CliInternals.BooleanFlags,
	},
);

export const forceFlagProvided =
	parsedLambdaCli.f ||
	parsedLambdaCli.force ||
	parsedLambdaCli.yes ||
	parsedLambdaCli.y;
