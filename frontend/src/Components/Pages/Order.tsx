import { motion } from "framer-motion";
import {
  FaFacebookF,
  FaClipboardList,
  FaCreditCard,
  FaTruck,
} from "react-icons/fa";

const steps = [
  {
    icon: FaFacebookF,
    title: "Message us on Facebook",
    desc: "Send us a DM with the design or rashguard you're interested in.",
  },
  {
    icon: FaClipboardList,
    title: "Fill in your details",
    desc: "We'll ask for your size, design preferences, and contact info.",
  },
  {
    icon: FaCreditCard,
    title: "Confirm and pay",
    desc: "Once details are confirmed, we'll send payment instructions.",
  },
  {
    icon: FaTruck,
    title: "Sit back and wait",
    desc: "Your custom piece gets crafted and shipped straight to you.",
  },
];

const Order = () => {
  return (
    <main className="min-h-screen bg-black">
      <div className="min-h-screen flex flex-col items-center pt-20 sm:pt-24 px-6 sm:px-10 text-white border-b border-borderColor">

        <div className="flex flex-col max-w-7xl w-full py-10 sm:py-16 lg:py-20 gap-2">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-floesky font-montserrat text-xs sm:text-sm font-bold tracking-widest"
          >
            HOW TO
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-white text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] font-archivo tracking-tighter leading-none"
          >
            ORDER
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-descText font-montserrat text-sm sm:text-base font-light max-w-xs sm:max-w-lg mt-2"
          >
            No checkout, no hassle. Every piece is custom made — just reach out
            and we'll guide you through it.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 max-w-7xl w-full border border-borderColor">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
                className="
                  flex flex-col gap-4 p-6 sm:p-8
                  border-b border-borderColor
                  sm:border-r
                  sm:even:border-r-0
                  lg:border-b-0 lg:border-r lg:last:border-r-0
                "
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-floesky text-purewhite flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-steps font-archivo text-4xl sm:text-5xl font-bold leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="font-archivo text-lg sm:text-xl tracking-tight">
                  {step.title}
                </h3>
                <p className="text-descText font-montserrat text-xs sm:text-sm leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col items-center gap-4 max-w-7xl w-full border border-t-0 border-borderColor p-8 sm:p-12 text-center"
        >
          <p className="text-descText font-montserrat text-xs sm:text-sm tracking-widest">
            READY TO START YOUR COMMISSION?
          </p>
          <a
            href="https://www.facebook.com/profile.php?id=61573306476553"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black border border-floesky font-montserrat font-bold
              text-white text-xs sm:text-sm w-full max-w-xs sm:w-82 h-12 sm:h-13
              flex items-center justify-center gap-2 tracking-widest
              hover:opacity-90 transition duration-300 hover:bg-floesky hover:text-black"
          >
            <FaFacebookF /> MESSAGE US ON FACEBOOK
          </a>
        </motion.div>

        <div className="pb-16 sm:pb-20" />
      </div>
    </main>
  );
};

export default Order;