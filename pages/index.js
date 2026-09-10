import Portfolio from '../components/portfolio/Portfolio';
import { readPortfolioCopy } from '../lib/portfolioCopy';
export default Portfolio;
export function getStaticProps(){return {props:{copy:readPortfolioCopy()}};}
