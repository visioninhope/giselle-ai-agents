import { SiGithub, SiGoogle } from "@icons-pack/react-simple-icons";
import { MailIcon } from "lucide-react";
import React from "react";

const SignupPage = () => {
	return (
		<div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
			<div className="text-center">
				<h2 className="mt-6 text-3xl font-extrabold text-cyan-300">
					Unleash Your Potential
					<br />- Free of Charge.
				</h2>
				<p className="mt-2 text-sm text-gray-400">
					• Easy setup, no coding required
					<br />• Free forever for core features
					<br />• 14-day trial of premium features & apps
				</p>
			</div>
			<div className="mt-8 space-y-6">
				<div className="text-xl text-center text-white mb-4">
					Get Started for free
				</div>
				<div className="space-y-2">
					<button
						className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
						type="button"
					>
						<SiGoogle className="h-5 w-5 mr-2" /> Sign up with Google
					</button>
					{/**<button
							className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
							type="button"
						>
							<Microsoft className="h-5 w-5 mr-2" /> Sign up with Microsoft
						</button>**/}
					<button
						className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
						type="button"
					>
						<SiGithub className="h-5 w-5 mr-2" /> Sign up with GitHub
					</button>
				</div>
				<div className="relative">
					<div className="absolute inset-0 flex items-center">
						<div className="w-full border-t border-gray-600"></div>
					</div>
					<div className="relative flex justify-center text-sm">
						<span className="px-2 bg-navy-900 text-gray-400">or</span>
					</div>
				</div>
				<button className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500">
					<MailIcon className="h-5 w-5 mr-2" /> Sign up for Email
				</button>
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
					Already have an account?{" "}
					<a href="#" className="font-medium text-cyan-300 hover:text-cyan-200">
						Log in
					</a>
				</p>
			</div>
		</div>
	);
};

export default SignupPage;
