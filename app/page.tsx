import FrontPageInfo from "@/app/components/FrontPageInfo";

export const metadata = {
	title: 'Food Fetchers | Home'
}

export default function Home() {
	const cssStyle = `
		#headpad {
        	height: 0px;
        }
        #background {
        	background-image:url(Images/background1.jpg);
        }
	`;
	return (
		<>
			<div id = "background"></div>
			{/* TODO: get this page re-written reasonably */}
			<div id="landing">
				<div id="intro">
					<p id="title">
						Fast.<br/>
						Simple.<br/>
						Delicious.<br/>
					</p>
					<p id="sub-title">
						<i>The Meal Planner Made For You</i>
					</p>
				</div>
			</div>
			<div id="border-line" style={{height: "1.5vh", backgroundColor: "var(--green)"}}></div>

			<FrontPageInfo/>
		</>
	);
}
