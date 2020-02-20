import {
	Middleware,

	LazyMiddlewareFactory,
	BranchMiddlewareCondition,
	CaughtMiddlewareHandler
} from './types';

import { compose } from './compose';
import {
	getLazyMiddleware,
	getTapMiddleware,
	getForkMiddleware,
	getBranchMiddleware,
	getOptionalMiddleware,
	getFilterMiddleware,
	getBeforeMiddleware,
	getAfterMiddleware,
	getEnforceMiddleware,
	getCaughtMiddleware,
	getConcurrencyMiddleware
} from './snippets';

import { assertMiddleware } from './helpers';

/**
 * A simple middleware compose builder
 */
export class Composer<T extends object, R = T> {
	protected middlewares: Middleware<R>[] = [];

	/**
	 * Invokes a new instance of the Composer class
	 */
	public static builder<Context extends object>(): Composer<Context> {
		return new Composer<Context>();
	}

	/**
	 * The number of middleware installed in Composer
	 */
	public get length(): number {
		return this.middlewares.length;
	}

	/**
	 * Clones a composer object
	 */
	public clone<V = {}>(): Composer<T & V, R> {
		const composer = new Composer<T & V, R>();

		composer.middlewares = [...this.middlewares];

		return composer;
	}

	/**
	 * Adds middleware to the chain
	 */
	public use<V = {}>(middleware: Middleware<T & V>): Composer<T & V, R> {
		assertMiddleware<R>(middleware);

		this.middlewares.push(middleware);

		return this;
	}

	/**
	 * Lazily asynchronously gets middleware
	 */
	public lazy<V = {}>(factory: LazyMiddlewareFactory<T & V>): Composer<T & V, R> {
		return this.use(
			getLazyMiddleware<T & V>(
				factory
			)
		);
	}

	/**
	 * Runs the middleware and force call `next()`
	 */
	public tap<V = {}>(middleware: Middleware<T & V>): Composer<T & V, R> {
		return this.use(
			getTapMiddleware<T & V>(
				middleware
			)
		);
	}

	/**
	 * Runs the middleware at the next event loop and force call `next()`
	 */
	public fork<V = {}>(middleware: Middleware<T & V>): Composer<T & V, R> {
		return this.use(
			getForkMiddleware<T & V>(
				middleware
			)
		);
	}

	/**
	 * By condition splits the middleware
	 */
	public branch<V = {}>(
		condition: BranchMiddlewareCondition<T & V>,

		trueMiddleware: Middleware<T & V>,
		falseMiddleware: Middleware<T & V>
	): Composer<T & V, R> {
		return this.use(
			getBranchMiddleware<T & V>(
				condition,

				trueMiddleware,
				falseMiddleware
			)
		);
	}

	/**
	 * Conditionally runs optional middleware or skips middleware
	 */
	public optional<V = {}>(
		condition: BranchMiddlewareCondition<T & V>,
		optionalMiddleware: Middleware<T & V>
	): Composer<T & V, R> {
		return this.use(
			getOptionalMiddleware<T & V>(
				condition,
				optionalMiddleware
			)
		);
	}

	/**
	 * Conditionally runs middleware or stops the chain
	 */
	public filter<V = {}>(
		condition: BranchMiddlewareCondition<T & V>,
		filterMiddleware: Middleware<T & V>
	): Composer<T & V, R> {
		return this.use(
			getFilterMiddleware<T & V>(
				condition,
				filterMiddleware
			)
		);
	}

	/**
	 * Runs the second middleware before the main
	 */
	public before<V = {}>(
		beforeMiddleware: Middleware<T & V>,
		middleware: Middleware<T & V>
	): Composer<T & V, R> {
		return this.use(
			getBeforeMiddleware<T & V>(
				middleware,
				beforeMiddleware
			)
		);
	}

	/**
	 * Runs the second middleware after the main
	 */
	public after<V = {}>(
		middleware: Middleware<T & V>,
		afterMiddleware: Middleware<T & V>
	): Composer<T & V, R> {
		return this.use(
			getAfterMiddleware<T & V>(
				middleware,
				afterMiddleware
			)
		);
	}

	/**
	 * Runs middleware before and after the main
	 */
	public enforce<V = {}>(
		beforeMiddleware: Middleware<T & V>,
		middleware: Middleware<T & V>,
		afterMiddleware: Middleware<T & V>
	): Composer<T & V, R> {
		return this.use(
			getEnforceMiddleware<T & V>(
				middleware,
				beforeMiddleware,
				afterMiddleware
			)
		);
	}

	/**
	 * Catches errors in the middleware chain
	 */
	public caught<V = {}>(errorHandler: CaughtMiddlewareHandler<T & V>): Composer<T & V, R> {
		return this.use(
			getCaughtMiddleware<T & V>(
				errorHandler
			)
		);
	}

	/**
	 * Concurrently launches middleware,
	 * the chain will continue if `next()` is called in all middlewares
	 */
	public concurrency<V = {}>(
		middlewares: Middleware<T & V>[]
	): Composer<T & V, R> {
		return this.use(
			getConcurrencyMiddleware<T & V>(
				middlewares
			)
		);
	}

	/**
	 * Compose middleware handlers into a single handler
	 */
	public compose(): Middleware<R> {
		return compose([...this.middlewares]);
	}
}
