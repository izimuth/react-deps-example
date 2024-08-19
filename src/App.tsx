import './App.css'
import { createDependencyContainer } from './deps';
import { StrictMode, useEffect, useState } from 'react';

type CountListener = (value: number) => void;

// a simple service that lets you increment a counter and subscribe update listeners
class CounterService
{
	private _count = 0;
	private _listeners = new Set<CountListener>();

	public subscribe(fn: CountListener)
	{
		this._listeners.add(fn);
		return () => { this._listeners.delete(fn) };
	}

	public increment()
	{
		this._count++;

		for(const fn of this._listeners)
		{
			fn(this._count);
		}
	}
}

// create our dependency provider and consumer hook
const [ DependencyProvider, useDependency ] = createDependencyContainer<{ counter: CounterService }>();

// an example consumer component
function CounterConsumer()
{
	// get the dependency 
	const counter = useDependency('counter');
	
	// used below
	const [count, setCount] = useState(0);

	// subscribe to the counter when the component mounts and remove it when the component is unmounted
	useEffect(() => {
		return counter?.subscribe(val => setCount(val));
	}, []);

	return (
		<div>
			Count: {count}<br/>
			<button onClick={() => counter?.increment()}>Increment</button>
		</div>
	);
}

function App() 
{
	return (
		<StrictMode>
			<DependencyProvider deps={{ counter: new CounterService() }}>
				<CounterConsumer></CounterConsumer>
			</DependencyProvider>
		</StrictMode>
	);
}

export default App
