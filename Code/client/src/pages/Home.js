// Example usage in Home.jsx
import "../App.css";
import FAQ from "../components/Faqs";
import DomainRecommendations from "../components/home/domain-specfic";
import Hero from "../components/home/hero";
import InstantFeedback from "../components/home/instant-feedback";
import NextSteps from "../components/home/next-steps";
import SkillTracking from "../components/home/skill-level";
import SkillTests from "../components/home/skill-test";

const Home = () => {
  return (
    <>
      <Hero />
      <SkillTests />
      <DomainRecommendations />
      <InstantFeedback />
      <SkillTracking />
      <FAQ />
      <NextSteps />
    </>
  );
};

export default Home;
