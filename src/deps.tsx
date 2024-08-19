import React, { createContext, useContext } from "react";

// type for dependency service map
type DependencyMap<DepT> = {
	[K in keyof DepT]?: DepT[K];
};

// the actual container that holds the dependency instances
class DependencyContainer<T extends object>
{
	// dependency map
	private _deps: DependencyMap<T> = {};

	// assign dependencies
	public set(deps: DependencyMap<T>)
	{
		this._deps = { ...this._deps, ...deps };
	}

	// get a dependency by key
	public get(key: keyof DependencyMap<T>)
	{
		return this._deps[key];
	}
}

// helper types for below
type DepProviderFn<T> = (args: { deps: T, children: JSX.Element | JSX.Element[] }) => JSX.Element;
type DepContextFn<T extends object> = (key: keyof T) => DependencyMap<T>[keyof T];

// create a dependency provider/hook based on the given type
// returns a Provider component that takes a deps property that matches T and a wrapper hook to consume the context
export function createDependencyContainer<T extends object>(): [ DepProviderFn<T>, DepContextFn<T> ]
{
	// create context with an empty default
	const DepContext = createContext<DependencyContainer<T>>(new DependencyContainer<T>());

	// create a provider component based on the context above
	const DepProvider = ({ deps, children }: { deps: T, children: JSX.Element | JSX.Element[] }) => {
		const ctr = new DependencyContainer();
		ctr.set(deps);

		return (
			<DepContext.Provider value={ctr}>
				{children}
			</DepContext.Provider>
		);
	};

	// create a useContext wrapper used like useDependency('myservice');
	const useDeps: DepContextFn<T> = (key) => {
		const ctr = useContext(DepContext);
		return ctr.get(key);
	}

	return [DepProvider, useDeps];
}