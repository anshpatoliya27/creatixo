import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ChevronDown, Zap, Shield, Sparkles } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/proplan.css";

const ProPlan = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const plans = [
    {
      name: "Starter",
      description: "Perfect for individuals exploring Creatixo.",
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        { name: "Access to basic campaigns", included: true },
        { name: "Standard community support", included: true },
        { name: "5 saved posts per day", included: true },
        { name: "Advanced analytics", included: false },
        { name: "Priority visibility", included: false },
        { name: "Ad-free experience", included: false },
      ],
      buttonText: "Current Plan",
      buttonVariant: "outline",
      isPremium: false,
    },
    {
      name: "Pro",
      description: "For creators & professionals looking to scale.",
      monthlyPrice: 19,
      annualPrice: 15, // $15 * 12 = $180/yr
      features: [
        { name: "Access to premium campaigns", included: true },
        { name: "Priority 24/7 support", included: true },
        { name: "Unlimited saved posts", included: true },
        { name: "Advanced AI analytics", included: true },
        { name: "Priority visibility in feeds", included: true },
        { name: "Ad-free experience", included: true },
      ],
      buttonText: "Upgrade to Pro",
      buttonVariant: "primary",
      isPremium: true,
      badge: "Most Popular",
    },
    {
      name: "Enterprise",
      description: "Dedicated solutions for large organizations.",
      monthlyPrice: 99,
      annualPrice: 79,
      features: [
        { name: "Everything in Pro", included: true },
        { name: "Dedicated account manager", included: true },
        { name: "Custom API access", included: true },
        { name: "Collaborative team workspaces", included: true },
        { name: "White-label reports", included: true },
        { name: "Custom SLA", included: true },
      ],
      buttonText: "Contact Sales",
      buttonVariant: "outline",
      isPremium: false,
    },
  ];

  const faqs = [
    {
      question: "Can I cancel my subscription at any time?",
      answer: "Yes, you can cancel your subscription at any time from your account settings. You'll retain access to Pro features until the end of your current billing cycle.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express) as well as PayPal and Apple Pay for seamless transactions.",
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 14-day money-back guarantee for all annual plans if you are not fully satisfied with our premium features.",
    },
    {
      question: "Can I switch from Monthly to Annual later?",
      answer: "Absolutely! You can upgrade to an annual plan at any time and the remaining balance of your monthly subscription will be prorated.",
    },
  ];

  return (
    <>
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="pro-plan-wrapper">
        <div className="pro-bg-glow"></div>
        
        <motion.div 
          className="pro-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="pro-badge">
            <Sparkles size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
            Creatixo Pro
          </div>
          <h1 className="pro-title">Unlock Your Creative Potential</h1>
          <p className="pro-subtitle">
            Upgrade your account to access advanced analytics, premium campaigns, and enhanced visibility. Choose the plan that fits your ambition.
          </p>
        </motion.div>

        <motion.div 
          className="pro-toggle-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span 
            className={`pro-toggle-label ${!isAnnual ? 'active' : ''}`}
            onClick={() => setIsAnnual(false)}
          >
            Monthly
          </span>
          <div className="pro-toggle" onClick={() => setIsAnnual(!isAnnual)}>
            <div className={`pro-toggle-knob ${isAnnual ? 'annual' : ''}`}></div>
          </div>
          <span 
            className={`pro-toggle-label ${isAnnual ? 'active' : ''}`}
            onClick={() => setIsAnnual(true)}
          >
            Annually <span className="pro-save-badge">Save 20%</span>
          </span>
        </motion.div>

        <div className="pro-cards-container">
          {plans.map((plan, idx) => (
            <motion.div 
              key={plan.name}
              className={`pro-card ${plan.isPremium ? 'premium' : ''}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + (idx * 0.1) }}
            >
              {plan.badge && (
                <div className="pro-most-popular">{plan.badge}</div>
              )}
              
              <div className="pro-card-header">
                <h3 className="pro-plan-name">{plan.name}</h3>
                <p className="pro-plan-desc">{plan.description}</p>
              </div>

              <div className="pro-plan-price">
                <span className="pro-price-currency">$</span>
                {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                <span className="pro-price-period">/mo</span>
              </div>
              
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '30px', minHeight: '20px' }}>
                {isAnnual && plan.annualPrice > 0 ? `Billed $${plan.annualPrice * 12} yearly` : ' '}
              </div>

              <div className="pro-divider"></div>

              <div className="pro-features">
                {plan.features.map((feature, fIdx) => (
                  <div key={fIdx} className={`pro-feature-item ${!feature.included ? 'disabled' : ''}`}>
                    {feature.included ? (
                      <Check className="pro-feature-icon" size={18} />
                    ) : (
                      <X className="pro-feature-icon" size={18} />
                    )}
                    <span className="pro-feature-text">{feature.name}</span>
                  </div>
                ))}
              </div>

              <button className={`pro-btn pro-btn-${plan.buttonVariant}`}>
                {plan.buttonText}
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="pro-faq-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="pro-faq-title">Frequently Asked Questions</h2>
          <div className="pro-faq-list">
            {faqs.map((faq, idx) => (
              <div key={idx} className="pro-faq-item" onClick={() => setOpenFaq(openFaq === idx ? null : idx)}>
                <div className="pro-faq-header">
                  <span className="pro-faq-question">{faq.question}</span>
                  <ChevronDown 
                    className={`pro-faq-icon ${openFaq === idx ? 'open' : ''}`} 
                    size={20} 
                  />
                </div>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className="pro-faq-answer">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
        
        <div className="pro-bg-glow-bottom"></div>
      </div>
      
      <Footer />
    </>
  );
};

export default ProPlan;
