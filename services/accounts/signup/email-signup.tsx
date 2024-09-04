import { Send } from "lucide-react";
import React from "react";

const EmailSignUpComponent = () => {
	return (
		<div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
			<div className="max-w-md w-full space-y-8">
				<div className="text-center">
					<h2 className="mt-6 text-3xl font-bold text-white">
						Create new account
						<br />
						with Email.
					</h2>
					<p className="mt-2 text-sm text-gray-400">
						Free forever. No credit card required.
					</p>
				</div>
				<form className="mt-8 space-y-6">
					<div className="rounded-md shadow-sm -space-y-px">
						<div>
							<label htmlFor="email-address" className="sr-only">
								Email address
							</label>
							<input
								id="email-address"
								name="email"
								type="email"
								autoComplete="email"
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white bg-gray-800 rounded-t-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm"
								placeholder="you@example.com"
							/>
						</div>
						<div className="flex items-center justify-between">
							<div className="w-full">
								<label htmlFor="password" className="sr-only">
									Password
								</label>
								<input
									id="password"
									name="password"
									type="password"
									autoComplete="current-password"
									required
									className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white bg-gray-800 rounded-b-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm"
									placeholder="********"
								/>
							</div>
							<a
								href="#"
								className="text-sm text-cyan-300 hover:text-cyan-200 ml-2"
							>
								Forget password?
							</a>
						</div>
					</div>

					<div>
						<button
							type="submit"
							className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
						>
							<span className="absolute left-0 inset-y-0 flex items-center pl-3">
								<Send
									className="h-5 w-5 text-cyan-500 group-hover:text-cyan-400"
									aria-hidden="true"
								/>
							</span>
							Sign in
						</button>
					</div>
				</form>

				<p className="mt-2 text-center text-sm text-gray-400">
					By continuing, you agree to our{" "}
					<a href="#" className="font-medium text-cyan-300 hover:text-cyan-200">
						Terms of Service
					</a>{" "}
					and{" "}
					<a href="#" className="font-medium text-cyan-300 hover:text-cyan-200">
						Privacy Policy
					</a>
					.
				</p>

				<p className="text-center text-sm text-gray-400">
					Get started for free by{" "}
					<a href="#" className="font-medium text-cyan-300 hover:text-cyan-200">
						other way?
					</a>
				</p>
			</div>
		</div>
	);
};

export default EmailSignUpComponent;
