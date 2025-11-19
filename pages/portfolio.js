import Head from "next/head";
import Nav from "@/components/Navbar";

function Portfolio() {
  return (
    <div className="bg-gray-900 min-h-screen">
      <Head>
        <title>Portfolio - Stanford Development Solutions</title>
        <meta
          name="description"
          content="Portfolio of Stanford Development Solutions"
        />
        <link rel="icon" href="/StanfordDevLogo.ico" />
      </Head>
      <Nav />
      <main className="container mx-auto py-12">
        <h1 className="text-4xl font-bold text-white mb-8">Our Work</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-gray-800 rounded-lg shadow-lg">
            <a href="https://www.libertyhousespecialties.com/">
              <img
                className="rounded-t-lg"
                src="/images/lhs.png"
                alt="Liberty House Specialties"
              />
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Liberty House Specialties
                </h2>
              </div>
            </a>
          </div>
          <div className="bg-gray-800 rounded-lg shadow-lg">
            <a href="https://atlas-it.vercel.app/">
              <img
                className="rounded-t-lg"
                src="/images/atlas.png"
                alt="Atlas IT Solutions"
              />
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Atlas IT Solutions
                </h2>
              </div>
            </a>
          </div>
          <div className="bg-gray-800 rounded-lg shadow-lg">
            <a href="https://fit-fuel.vercel.app/">
              <img
                className="rounded-t-lg"
                src="/images/fitfuel.png"
                alt="FitFuel"
              />
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  FitFuel (practice)
                </h2>
              </div>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Portfolio;
