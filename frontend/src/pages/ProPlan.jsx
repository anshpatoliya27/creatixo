import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ChevronDown, Sparkles, Crown, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/proplan.css";

const API = "http://localhost:5000/api";

const ProPlan = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [proStatus, setProStatus] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  let user = null;
  try { user = JSON.parse(localStorage.getItem("user") || "null"); } catch { user = null; }

  // Fetch current subscription status
  useEffect(() => {
    if (!token) return;
    fetch(`${API}/payment/status`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setProStatus(data))
      .catch((err) => console.error("Status fetch error:", err));
  }, [token]);

  const plans = [
    {
      id: "starter",
      name: "Starter",
      description: "Perfect for individuals exploring Creatixo.",
      monthlyPrice: 0,
      annualPrice: 0,
      planKey: null,
      features: [
        { name: "5 posts per day", included: true },
        { name: "Standard community support", included: true },
        { name: "5 saved posts per day", included: true },
        { name: "Video uploads", included: false },
        { name: "Promoted video ads", included: false },
        { name: "Advanced analytics", included: false },
      ],
      buttonText: "Current Plan",
      buttonVariant: "outline",
      isPremium: false,
    },
    {
      id: "pro",
      name: "Pro",
      description: "For creators & professionals looking to scale.",
      monthlyPrice: 1900,
      annualPrice: 15000,
      monthlyPlanKey: "pro_monthly",
      annualPlanKey: "pro_annual",
      features: [
        { name: "Unlimited posts & uploads", included: true },
        { name: "Video uploads with preview", included: true },
        { name: "Showcase video ads on home", included: true },
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
      id: "enterprise",
      name: "Enterprise",
      description: "Dedicated solutions for large organizations.",
      monthlyPrice: 9900,
      annualPrice: 79000,
      monthlyPlanKey: "enterprise_monthly",
      annualPlanKey: "enterprise_annual",
      features: [
        { name: "Everything in Pro", included: true },
        { name: "Dedicated account manager", included: true },
        { name: "Custom API access", included: true },
        { name: "Collaborative team workspaces", included: true },
        { name: "White-label reports", included: true },
        { name: "Custom SLA & priority", included: true },
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
      answer: "We accept UPI, all major credit/debit cards (Visa, Mastercard, RuPay), net banking, and popular wallets like Paytm, PhonePe, and Google Pay via Razorpay.",
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 14-day money-back guarantee for all annual plans if you are not fully satisfied with our premium features.",
    },
    {
      question: "Can I switch from Monthly to Annual later?",
      answer: "Absolutely! You can upgrade to an annual plan at any time and the remaining balance of your monthly subscription will be prorated.",
    },
    {
      question: "What happens when my Pro plan expires?",
      answer: "Your account will automatically switch back to the free Starter plan. Your existing posts, videos, and ads will remain live, but you won't be able to create new videos or ads.",
    },
  ];

  const handlePayment = async (plan) => {
    if (!token || !user) {
      navigate("/login");
      return;
    }

    const planKey = isAnnual ? plan.annualPlanKey : plan.monthlyPlanKey;
    if (!planKey) return;

    setLoadingPlan(plan.id);

    try {
      // Step 1: Create Razorpay order on backend
      const orderRes = await fetch(`${API}/payment/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: planKey }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        alert(orderData.message || "Failed to create order");
        setLoadingPlan(null);
        return;
      }

      // Step 2: Open Razorpay Checkout
      const options = {
        key: orderData.key,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Creatixo",
        description: `${orderData.plan.label} Plan`,
        order_id: orderData.order.id,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#2563eb",
          backdrop_color: "rgba(15, 23, 42, 0.85)",
        },
        handler: async function (response) {
          // Step 3: Verify payment on backend
          try {
            const verifyRes = await fetch(`${API}/payment/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: planKey,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              // Update localStorage user with Pro status
              const updatedUser = { ...user, ...verifyData.user };
              localStorage.setItem("user", JSON.stringify(updatedUser));
              setProStatus({ isPro: true, proPlan: planKey });
              setPaymentSuccess(true);
              setTimeout(() => setPaymentSuccess(false), 5000);
            } else {
              alert("Payment verification failed. Contact support.");
            }
          } catch (err) {
            console.error("Verify error:", err);
            alert("Payment verification error. Please contact support.");
          }
          setLoadingPlan(null);
        },
        modal: {
          ondismiss: function () {
            setLoadingPlan(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment initiation failed. Try again.");
      setLoadingPlan(null);
    }
  };

  const isCurrentPlan = (plan) => {
    if (!proStatus?.isPro && plan.id === "starter") return true;
    if (proStatus?.isPro && proStatus.proPlan?.startsWith(plan.id)) return true;
    return false;
  };

  const getDisplayPrice = (plan) => {
    const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
    if (price === 0) return "0";
    // Convert paise to rupees for display
    const monthly = isAnnual ? Math.round(price / 12) : price;
    return `₹${monthly.toLocaleString("en-IN")}`;
  };

  return (
    <>
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Payment Success Overlay */}
      <AnimatePresence>
        {paymentSuccess && (
          <motion.div
            className="pro-success-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="pro-success-card"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <div className="pro-success-icon">
                <Crown size={48} />
              </div>
              <h2>Welcome to Creatixo Pro! 🎉</h2>
              <p>Your Pro plan is now active. A confirmation email has been sent to your registered email address.</p>
              <button className="pro-btn pro-btn-primary" onClick={() => { setPaymentSuccess(false); navigate("/post"); }}>
                Start Creating →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
            Upgrade to access unlimited posts, video uploads, promoted ads on the home feed, and advanced analytics. Choose the plan that fits your ambition.
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
                {plan.monthlyPrice === 0 ? (
                  <>
                    <span className="pro-price-currency">₹</span>0
                    <span className="pro-price-period">/mo</span>
                  </>
                ) : (
                  <>
                    {getDisplayPrice(plan)}
                    <span className="pro-price-period">/mo</span>
                  </>
                )}
              </div>

              <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '30px', minHeight: '20px' }}>
                {isAnnual && plan.annualPrice > 0 ? `Billed ₹${plan.annualPrice.toLocaleString("en-IN")} yearly` : ' '}
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

              {isCurrentPlan(plan) ? (
                <button className="pro-btn pro-btn-outline" disabled style={{ opacity: 0.6, cursor: "default" }}>
                  <Crown size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
                  Current Plan
                </button>
              ) : plan.id === "starter" ? (
                <button className="pro-btn pro-btn-outline" disabled style={{ opacity: 0.5, cursor: "default" }}>
                  Free Forever
                </button>
              ) : (
                <button
                  className={`pro-btn pro-btn-${plan.buttonVariant}`}
                  onClick={() => handlePayment(plan)}
                  disabled={loadingPlan === plan.id}
                >
                  {loadingPlan === plan.id ? (
                    <><Loader2 size={18} className="pro-spinner" style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} /> Processing...</>
                  ) : (
                    plan.buttonText
                  )}
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Trust badges */}
        <motion.div
          className="pro-trust-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="pro-trust-item">🔒 Secured by Razorpay</div>
          <div className="pro-trust-item">💳 UPI / Cards / Wallets</div>
          <div className="pro-trust-item">📧 Instant Email Receipt</div>
          <div className="pro-trust-item">↩️ 14-Day Money Back</div>
        </motion.div>

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
