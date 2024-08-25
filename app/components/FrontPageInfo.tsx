import Image from "next/image"
import plate1 from "@/public/images/plate1.png"

export default function FrontPageInfo(){
    return (
        <div id="info">
            <div id="info-cover">
                <div>
                    <table style={{borderSpacing: "3vh", fontSize: "2.5vh", color: "#333"}}>
                        <tbody>
                            <tr>
                                <td style={{border: "4px solid var(--green)", borderRight: "0"}}></td>
                                <td>
                                    <p>
                                        Upload your own <br/>
                                        delicious recipes.
                                    </p>
                                </td>
                                <td style={{border: "4px solid var(--green)", borderRight: "0"}}></td>
                                
                                <td style={{border: "4px solid var(--green)", borderRight: "0"}}></td>
                                <td>
                                    <p>
                                        Browse our collection of dozens <br/>
                                        of tasty recipes to find meals that <br/>
                                        satisfy your diet and your appetite.
                                    </p>
                                </td>
                                <td style={{border: "4px solid var(--green)", borderRight: "0"}}></td>
                            </tr>
                            
                            <tr style={{padding: "2vh"}}>
                                <td style={{border: "4px solid var(--green)", borderRight: "0"}}></td>
                                <td>
                                    <p>
                                        Schedule your meals <br/>
                                        to spend <b>less time planning</b> <br/>
                                        and <b>more time enjoying</b><br/>
                                        the food you create.
                                    </p>
                                </td>

                                <td style={{border: "4px solid var(--green)", borderRight: "0"}}></td>
                                
                                <td style={{border: "4px solid var(--green)", borderRight: "0"}}></td>
                                <td>
                                    <p>
                                        We will fill out your grocery lists <br/>
                                        to ensure you&apos;re <b>always prepared</b> <br/>
                                        with every ingredient you need.
                                    </p>
                                </td>
                                <td style={{border: "4px solid var(--green)", borderRight: "0"}}></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="aspect-square">
                <Image 
                    id="plate1"
                    alt="Image of a plate"
                    src={plate1}
                />
            </div>
            
            <div id="info-title">
                <div>
                    <p style={{fontSize: "5vh", borderBottom: "3px solid var(--green)"}}>
                        Plan for a Healthier You
                    </p>
                    <p style={{fontSize: "2.5vh"}}>
                        Create customized meal plans tailored to your lifestyle, budget and tastes
                    </p>
                </div>
            </div>
        </div>
    );
}