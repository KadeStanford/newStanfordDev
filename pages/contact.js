import Head from "next/head";
import Nav from "@/components/Navbar";
import Estimator from "@/components/Estimator";
import { useState } from "react";
import axios from "axios";

function Contact() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    company: "",
    projectType: "",
    description: "",
    budget: "",
  });

  const handleChange = (e) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/contact", formState);
      alert("Message sent successfully");
    } catch (error) {
      alert("Failed to send message. Please try again later.");
      console.error(error);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen">
      <Head>
        <title>Contact - Stanford Development Solutions</title>
        <meta
          name="description"
          content="Contact Stanford Development Solutions"
        />
        <link rel="icon" href="/StanfordDevLogo.ico" />
      </Head>
      <Nav />
      <main className="container mx-auto py-12">
        <h1 className="text-4xl font-bold text-white mb-2">Free Estimate</h1>
        <p className="text-slate-400 mb-6">
          No obligation. Tell us about your goals and we will send a clear,
          friendly estimate.
        </p>
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          onSubmit={handleSubmit}
        >
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              Contact Information
            </h2>
            <div className="mb-4">
              <label htmlFor="name" className="block text-white font-bold mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full bg-gray-700 text-white rounded-lg py-2 px-4"
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-white font-bold mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full bg-gray-700 text-white rounded-lg py-2 px-4"
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="company"
                className="block text-white font-bold mb-2"
              >
                Company
              </label>
              <input
                type="text"
                id="company"
                name="company"
                className="w-full bg-gray-700 text-white rounded-lg py-2 px-4"
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              Estimate Details
            </h2>
            <div className="mb-4">
              <label
                htmlFor="projectType"
                className="block text-white font-bold mb-2"
              >
                Project Type
              </label>
              <select
                id="projectType"
                name="projectType"
                className="w-full bg-gray-700 text-white rounded-lg py-2 px-4"
                onChange={handleChange}
                required
              >
                <option value="">Select a project type</option>
                <option value="new-website">A new website</option>
                <option value="website-redesign">Redesign / Refresh</option>
                <option value="ecommerce">E-commerce</option>
                <option value="seo">SEO / Performance</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="mb-4">
              <label
                htmlFor="description"
                className="block text-white font-bold mb-2"
              >
                Project Description
              </label>
              <textarea
                id="description"
                name="description"
                rows="4"
                className="w-full bg-gray-700 text-white rounded-lg py-2 px-4"
                onChange={handleChange}
                required
              ></textarea>
            </div>
            <div className="mb-4">
              <label
                htmlFor="budget"
                className="block text-white font-bold mb-2"
              >
                Approximate Budget
              </label>
              <select
                id="budget"
                name="budget"
                className="w-full bg-gray-700 text-white rounded-lg py-2 px-4"
                onChange={handleChange}
                required
              >
                <option value="">Not sure / help me</option>
                <option value="<5000">&lt;$5,000</option>
                <option value="5000-10000">$5,000 - $10,000</option>
                <option value="10000-20000">$10,000 - $20,000</option>
                <option value=">20000">&gt;$20,000</option>
              </select>
              <p className="text-sm text-slate-400 mt-2">
                If you are unsure, choose &apos;Not sure&apos; — we will suggest
                options that fit your goals and budget.
              </p>
              {/* Estimator: updates the budget field with estimated price */}
              <div className="mt-4">
                <Estimator
                  projectType={formState.projectType}
                  onEstimateChange={(val) =>
                    setFormState((s) => ({ ...s, budget: val }))
                  }
                />
              </div>
            </div>
          </div>
          <div className="md:col-span-2 flex justify-center">
            <button
              type="submit"
              className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg"
            >
              Submit
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default Contact;
