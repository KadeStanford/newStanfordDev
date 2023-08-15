import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useEffect, useState } from "react";
import axios from "axios";

const inter = Inter({ subsets: ["latin"] });

function HomePageContent() {
  return (
    <div className={styles.homeContent}>
      <div className={styles.homeContentBox}>
        <h2 className={styles.homeContentTitle}>Need a website?</h2>
        <h3 className={styles.homeContentSubTitle}>
          {" "}
          I&#39;ve got you covered.
        </h3>
        <p className={styles.homeContentText}>
          {" "}
          <span className={styles.underline}>
            Your online presence matters.
          </span>{" "}
          I specialize in crafting impactful websites that speak volumes for
          your business. I&#39;m committed to building websites that leave a
          lasting impression. Let&#39;s turn your ideas into an online reality.
          <br></br>
          <br></br>
          With my skills and dedication to developing websites, I can guarantee
          a website that will reflect your business and suit your needs
          perfectly.
        </p>
      </div>
      <div className={styles.homeContentBox}>
        <h2 className={styles.homeContentTitle}>Meet the developer.</h2>
        <h3 className={styles.homeContentSubTitle}> Kade Stanford.</h3>
        <img className={styles.profileImage} src="/images/kadeProfile.jpg" />
        <p className={styles.homeContentTextKade}>
          {" "}
          I&#39;m a full stack web developer and a SELU Computer Science
          Student. My mission in creating SDS is to provide local businesses
          with web solutions that will help them grow and thrive in this digital
          age.
        </p>
      </div>
      <div className={styles.homeContentBox}>
        <h2 className={styles.homeContentTitle}>Why choose SDS?</h2>
        <h3 className={styles.homeContentSubTitle}>It&#39;s Simple.</h3>
        <p className={styles.homeContentText}>
          {" "}
          Other web development companies will charge you an arm and a leg for a
          website created with tools and style templates that are widely used,
          so your website won&#39;t really be{" "}
          <span className={styles.underline}>YOUR</span> website.<br></br>
          <br></br>
          SDS offers fully custom coded websites that are tailored to your
          specific needs and style preferences. Whatever you needs are, I can
          meet them.
        </p>
      </div>
    </div>
  );
}

function Portfolio() {
  return (
    <div className={styles.portfolioContent}>
      <div className={styles.portfolioContentBox1}>
        <a href="https://www.libertyhousespecialties.com/">
          <img className={styles.portfolioImage} src="/images/lhs.png" />
          <p className={styles.portfolioContentText}>
            Liberty House Specialties
          </p>
        </a>
      </div>
      <div className={styles.portfolioContentBox}>
        <a href="https://atlas-it.vercel.app/">
          <img className={styles.portfolioImage} src="/images/atlas.png" />
          <p className={styles.portfolioContentText}>Atlas It Solutions</p>
        </a>
      </div>
      <div className={styles.portfolioContentBox}>
        <a href="https://fit-fuel.vercel.app/">
          <img className={styles.portfolioImage} src="/images/fitfuel.png" />
          <p className={styles.portfolioContentText}>FitFuel (practice)</p>
        </a>
      </div>
    </div>
  );
}

function ContactPageContent() {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const message = formData.get("message");
    const name = formData.get("name");
    const email = formData.get("email");

    try {
      await axios.post("/api/contact", { name, email, message });
      alert("Message sent successfully");
    } catch (error) {
      alert("Failed to send message. Please try again later.");
      console.error(error);
    }
  };

  return (
    <div className={styles.contactContent}>
      <div className={styles.contactContentBox}>
        <h2 className={styles.contactContentTitle}>
          want to take your business to the next level?
        </h2>
        <h3 className={styles.contactContentSubTitle}> contact me.</h3>
        <p className={styles.contactContentText}>
          {" "}
          <span className={styles.underline}>
            Email: Stanforddevcontact@gmail.com
          </span>{" "}
          <br></br>
          <br></br>
        </p>
        <form className={styles.contactForm} onSubmit={handleSubmit}>
          <input
            className={styles.contactInput}
            type="text"
            placeholder="Name"
            required={true}
          />
          <input
            className={styles.contactInput}
            type="text"
            placeholder="Email"
            required={true}
          />
          <textarea
            className={styles.contactTextArea}
            type="text"
            placeholder="Message"
            required={true}
          />
          <button className={styles.contactButton} type="submit">
            Send
          </button>
        </form>
      </div>
      <div className={styles.contactContentBox}>
        <h2 className={styles.contactContentTitle}>not convinced?</h2>
        <h3 className={styles.contactContentSubTitle}>
          Check out my portfolio.
        </h3>
        <p className={styles.contactContentText}> </p>
        <div className={styles.portfolioContent}>
          <div className={styles.portfolioContentBox1}>
            <a href="https://www.libertyhousespecialties.com/">
              <p className={styles.portfolioContentText}>
                Liberty House Specialties
              </p>
            </a>
          </div>
          <div className={styles.portfolioContentBox}>
            <a href="https://atlas-it.vercel.app/">
              <p className={styles.portfolioContentText}>Atlas It Solutions</p>
            </a>
          </div>
          <div className={styles.portfolioContentBox}>
            <a href="https://fit-fuel.vercel.app/">
              <p className={styles.portfolioContentText}>FitFuel (practice)</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function ServicesPageContent() {
  return (
    <div className={styles.servicesContent}>
      <div className={styles.servicesContentBox}>
        <h2 className={styles.servicesContentTitle}>Web Development</h2>
        <h3 className={styles.servicesContentSubTitle}>includes,</h3>
        <ul className={styles.servicesContentList}>
          <li className={styles.servicesContentListItem}>
            {" "}
            Fully custom coded website
          </li>
          <li className={styles.servicesContentListItem}> Responsive design</li>
          <li className={styles.servicesContentListItem}>
            Domain setup and hosting
          </li>
          <li className={styles.servicesContentListItem}>
            On-Demand Maintenance and Updates
          </li>
        </ul>
        <h3 className={styles.servicesContentSubTitle}>Pricing:</h3>
        <p className={styles.servicesContentText}> Starting at $200 per page</p>
        <p className={styles.servicesContentTextOptional}>
          {" "}
          (optional) $75/per month On-Demand Maintenance
        </p>
        <p className={styles.servicesContentTextVary}>
          {" "}
          *prices vary depending on the complexity of the website - contact for
          an estimate
        </p>
      </div>
      <div className={styles.servicesContentBox}>
        <h2 className={styles.servicesContentTitle}>Social Media</h2>

        <h3 className={styles.servicesContentSubTitle}>Pricing:</h3>
        <p className={styles.servicesContentText}>
          {" "}
          Starting at $100/per month
        </p>
        <ul className={styles.servicesContentListSocial}>
          <li className={styles.servicesContentListItem}>
            {" "}
            12 posts / month - $100
          </li>
          <li className={styles.servicesContentListItem}>
            20 posts / month - $150
          </li>
          <li className={styles.servicesContentListItem}>
            {" "}
            30 posts / month - $200
          </li>
        </ul>
      </div>
    </div>
  );
}

export default function Home() {
  const [pageContent, setPageContent] = useState("home");

  function handlePageChange(page) {
    setPageContent(page);
  }
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div className={styles.topContainer}>
          <div className={styles.heroImageBox}>
            <img
              className={styles.logoImage}
              src="/images/StanfordDevLogo.png"
              alt="StanfordDev Logo"
            />
            <h2 className={styles.heroText}>Stanford Development Solutions</h2>
            <h3 className={styles.heroSubText}>- Innovative Web Solutions -</h3>
          </div>
          <div className={styles.buttonBox}>
            {" "}
            <button
              className={styles.button}
              onClick={() => handlePageChange("home")}
            >
              Home
            </button>
            <button
              className={styles.button}
              onClick={() => handlePageChange("contact")}
            >
              Contact
            </button>
            <button
              className={styles.button}
              onClick={() => handlePageChange("services")}
            >
              Services
            </button>
          </div>
        </div>
        <div className={styles.contentContainer}>
          {pageContent === "home" && <HomePageContent />}
          {pageContent === "contact" && <ContactPageContent />}
          {pageContent === "services" && <ServicesPageContent />}
        </div>
      </main>
    </>
  );
}
