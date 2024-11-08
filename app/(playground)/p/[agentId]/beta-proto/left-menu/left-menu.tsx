import { LayersIcon } from "../components/icons/layers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/tabs";

export function LeftMenu() {
	return (
		<Tabs orientation="vertical">
			<TabsList>
				<TabsTrigger value="overview">
					<LayersIcon className="w-[18px] h-[18px] fill-black-30" />
				</TabsTrigger>
				<TabsTrigger value="github">G</TabsTrigger>
			</TabsList>
			<TabsContent value="overview">Overview</TabsContent>
			<TabsContent value="github">GitHub</TabsContent>
		</Tabs>
	);
}
