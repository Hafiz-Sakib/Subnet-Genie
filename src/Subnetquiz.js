import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import NavBar from "./NavBar";
import "./App.css";

function generateQuestions() {
  const qs = [];

  // Q1: Host count from CIDR
  const cidr1 = [24, 25, 26, 27, 28, 29][Math.floor(Math.random() * 6)];
  const correct1 = Math.pow(2, 32 - cidr1) - 2;
  const wrongs1 = [
    correct1 + 2,
    correct1 - 2,
    Math.pow(2, 32 - cidr1),
    Math.floor(correct1 / 2),
  ]
    .filter((x) => x !== correct1)
    .slice(0, 3);
  qs.push({
    q: `How many usable host addresses are in a /${cidr1} subnet?`,
    options: shuffle([correct1, ...wrongs1]).map(String),
    answer: String(correct1),
    explanation: `A /${cidr1} subnet has ${Math.pow(2, 32 - cidr1)} total addresses. Subtract 2 (network + broadcast) = ${correct1} usable hosts.`,
    category: "Host Counting",
  });

  // Q2: Subnet mask from CIDR
  const masks = [
    { cidr: 24, mask: "255.255.255.0" },
    { cidr: 25, mask: "255.255.255.128" },
    { cidr: 26, mask: "255.255.255.192" },
    { cidr: 27, mask: "255.255.255.224" },
    { cidr: 28, mask: "255.255.255.240" },
    { cidr: 16, mask: "255.255.0.0" },
    { cidr: 8, mask: "255.0.0.0" },
    { cidr: 20, mask: "255.255.240.0" },
  ];
  const mk = masks[Math.floor(Math.random() * masks.length)];
  const wrongMasks = masks.filter((m) => m.mask !== mk.mask).map((m) => m.mask);
  qs.push({
    q: `What is the subnet mask for /${mk.cidr}?`,
    options: shuffle([mk.mask, wrongMasks[0], wrongMasks[1], wrongMasks[2]]),
    answer: mk.mask,
    explanation: `/${mk.cidr} means the first ${mk.cidr} bits are 1, giving mask ${mk.mask}.`,
    category: "Subnet Masks",
  });

  // Q3: Network address
  const ipData = [
    {
      input: "192.168.1.130/26",
      network: "192.168.1.128",
      wrongs: ["192.168.1.0", "192.168.1.192", "192.168.1.130"],
    },
    {
      input: "10.0.1.200/24",
      network: "10.0.1.0",
      wrongs: ["10.0.0.0", "10.0.1.200", "10.0.1.255"],
    },
    {
      input: "172.16.5.100/20",
      network: "172.16.0.0",
      wrongs: ["172.16.5.0", "172.16.4.0", "172.16.16.0"],
    },
    {
      input: "192.168.10.67/27",
      network: "192.168.10.64",
      wrongs: ["192.168.10.0", "192.168.10.32", "192.168.10.96"],
    },
  ];
  const nd = ipData[Math.floor(Math.random() * ipData.length)];
  qs.push({
    q: `What is the network address of ${nd.input}?`,
    options: shuffle([nd.network, ...nd.wrongs]),
    answer: nd.network,
    explanation: `Applying the subnet mask to ${nd.input.split("/")[0]} gives network ${nd.network}.`,
    category: "Network Address",
  });

  // Q4: IP class
  const classData = [
    { ip: "10.5.3.1", cls: "A", w: ["B", "C", "D"] },
    { ip: "172.20.1.1", cls: "B", w: ["A", "C", "D"] },
    { ip: "192.168.1.1", cls: "C", w: ["A", "B", "D"] },
    { ip: "224.0.0.5", cls: "D", w: ["A", "B", "C"] },
    { ip: "150.10.0.1", cls: "B", w: ["A", "C", "E"] },
    { ip: "100.64.1.1", cls: "A", w: ["B", "C", "D"] },
  ];
  const cd = classData[Math.floor(Math.random() * classData.length)];
  qs.push({
    q: `What class is the IP address ${cd.ip}?`,
    options: shuffle([`Class ${cd.cls}`, ...cd.w.map((w) => `Class ${w}`)]),
    answer: `Class ${cd.cls}`,
    explanation: `${cd.ip} starts with ${cd.ip.split(".")[0]}, which falls in the Class ${cd.cls} range.`,
    category: "IP Classes",
  });

  // Q5: Subnets from mask
  const sub = [
    { base: 24, new: 26, subnets: 4, w: ["2", "8", "16"] },
    { base: 24, new: 28, subnets: 16, w: ["8", "4", "32"] },
    { base: 16, new: 20, subnets: 16, w: ["8", "4", "32"] },
  ];
  const sd = sub[Math.floor(Math.random() * sub.length)];
  qs.push({
    q: `A /${sd.base} network is subnetted to /${sd.new}. How many subnets are created?`,
    options: shuffle([String(sd.subnets), ...sd.w]),
    answer: String(sd.subnets),
    explanation: `${sd.new} - ${sd.base} = ${sd.new - sd.base} additional bits borrowed. 2^${sd.new - sd.base} = ${sd.subnets} subnets.`,
    category: "Subnetting",
  });

  // Q6: Wildcard mask
  const wc = [
    {
      mask: "255.255.255.0",
      wild: "0.0.0.255",
      w: ["255.255.255.255", "0.0.255.0", "0.255.0.255"],
    },
    {
      mask: "255.255.255.240",
      wild: "0.0.0.15",
      w: ["0.0.0.255", "0.0.0.31", "255.255.255.15"],
    },
    {
      mask: "255.255.0.0",
      wild: "0.0.255.255",
      w: ["0.0.0.255", "255.0.0.0", "0.255.0.0"],
    },
  ];
  const wd = wc[Math.floor(Math.random() * wc.length)];
  qs.push({
    q: `What is the wildcard mask for subnet mask ${wd.mask}?`,
    options: shuffle([wd.wild, ...wd.w]),
    answer: wd.wild,
    explanation: `Wildcard mask = bitwise inverse of subnet mask. ${wd.mask} → ${wd.wild}`,
    category: "Wildcard Masks",
  });

  // Q7: Broadcast address
  const bData = [
    {
      cidr: "192.168.1.0/24",
      bc: "192.168.1.255",
      w: ["192.168.1.254", "192.168.0.255", "192.168.2.0"],
    },
    {
      cidr: "10.0.0.0/8",
      bc: "10.255.255.255",
      w: ["10.255.255.254", "10.0.255.255", "10.255.0.255"],
    },
    {
      cidr: "192.168.1.0/25",
      bc: "192.168.1.127",
      w: ["192.168.1.255", "192.168.1.128", "192.168.1.126"],
    },
  ];
  const bd = bData[Math.floor(Math.random() * bData.length)];
  qs.push({
    q: `What is the broadcast address of ${bd.cidr}?`,
    options: shuffle([bd.bc, ...bd.w]),
    answer: bd.bc,
    explanation: `The broadcast address is the last address in the subnet ${bd.cidr}: ${bd.bc}.`,
    category: "Broadcast",
  });

  // Q8: Private address?
  const privData = [
    { ip: "10.5.5.5", isPriv: true, w: ["Public", "Multicast", "Reserved"] },
    {
      ip: "8.8.8.8",
      isPriv: false,
      ans: "Public",
      w: ["Private (RFC 1918)", "Multicast", "Loopback"],
    },
    { ip: "172.20.0.1", isPriv: true, w: ["Public", "Multicast", "Loopback"] },
    {
      ip: "127.0.0.1",
      isPriv: false,
      ans: "Loopback",
      w: ["Private", "Public", "Multicast"],
    },
    {
      ip: "224.0.0.1",
      isPriv: false,
      ans: "Multicast",
      w: ["Private", "Public", "Loopback"],
    },
  ];
  const pd = privData[Math.floor(Math.random() * privData.length)];
  const pAns = pd.isPriv ? "Private (RFC 1918)" : pd.ans;
  const pWrongs = pd.isPriv ? pd.w : pd.w;
  qs.push({
    q: `How would you classify the IP address ${pd.ip}?`,
    options: shuffle([pAns, ...pWrongs]),
    answer: pAns,
    explanation: `${pd.ip} is ${pAns}. ${pd.isPriv ? "It falls within RFC 1918 private ranges." : ""}`,
    category: "IP Classification",
  });

  // Q9: CIDR from hosts needed
  const hostData = [
    { hosts: 50, cidr: "/26", w: ["/27", "/25", "/28"] },
    { hosts: 200, cidr: "/24", w: ["/25", "/23", "/26"] },
    { hosts: 10, cidr: "/28", w: ["/29", "/27", "/26"] },
    { hosts: 1000, cidr: "/22", w: ["/23", "/21", "/24"] },
  ];
  const hd = hostData[Math.floor(Math.random() * hostData.length)];
  qs.push({
    q: `What is the smallest CIDR that accommodates ${hd.hosts} hosts?`,
    options: shuffle([hd.cidr, ...hd.w]),
    answer: hd.cidr,
    explanation: `For ${hd.hosts} hosts, you need at least ${Math.ceil(Math.log2(hd.hosts + 2))} host bits. ${hd.cidr} gives ${Math.pow(2, 32 - parseInt(hd.cidr.slice(1))) - 2} usable hosts.`,
    category: "Sizing",
  });

  // Q10: VLSM concept
  qs.push({
    q: "What does VLSM (Variable Length Subnet Masking) allow you to do?",
    options: [
      "Use different subnet sizes within the same network",
      "Only use /24 subnets",
      "Assign multiple IPs to a single host",
      "Convert IPv4 to IPv6",
    ],
    answer: "Use different subnet sizes within the same network",
    explanation:
      "VLSM allows each subnet to have a different prefix length, maximizing address space efficiency by tailoring each subnet to its exact host needs.",
    category: "Concepts",
  });

  return qs;
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

const categoryColors = {
  "Host Counting": "#fabd2f",
  "Subnet Masks": "#06d6a0",
  "Network Address": "#74b9ff",
  "IP Classes": "#a29bfe",
  Subnetting: "#fd9644",
  "Wildcard Masks": "#fd79a8",
  Broadcast: "#06d6a0",
  "IP Classification": "#fabd2f",
  Sizing: "#74b9ff",
  Concepts: "#a29bfe",
};

export default function SubnetQuiz() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [started, setStarted] = useState(false);
  const [timer, setTimer] = useState(30);
  const [timedOut, setTimedOut] = useState(false);
  const [bestScore, setBestScore] = useState(() =>
    parseInt(localStorage.getItem("quiz_best") || "0"),
  );

  const startQuiz = () => {
    const qs = generateQuestions();
    setQuestions(qs);
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setAnswers([]);
    setFinished(false);
    setStarted(true);
    setTimer(30);
    setTimedOut(false);
  };

  const handleTimeout = useCallback(() => {
    if (selected !== null || timedOut) return;
    setTimedOut(true);
    setSelected("__timeout__");
    const q = questions[current];
    setAnswers((prev) => [
      ...prev,
      {
        q: q.q,
        selected: "Timed out",
        correct: q.answer,
        ok: false,
        explanation: q.explanation,
        category: q.category,
      },
    ]);
    setTimeout(() => {
      if (current + 1 < questions.length) {
        setCurrent((c) => c + 1);
        setSelected(null);
        setTimedOut(false);
        setTimer(30);
      } else {
        setFinished(true);
      }
    }, 1500);
  }, [selected, timedOut, questions, current]);

  useEffect(() => {
    if (!started || finished || selected !== null) return;
    if (timer === 0) {
      handleTimeout();
      return;
    }
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer, started, finished, selected, handleTimeout]);

  const handleSelect = (option) => {
    if (selected !== null) return;
    setSelected(option);
    const q = questions[current];
    const ok = option === q.answer;
    if (ok) setScore((s) => s + 1);
    setAnswers((prev) => [
      ...prev,
      {
        q: q.q,
        selected: option,
        correct: q.answer,
        ok,
        explanation: q.explanation,
        category: q.category,
      },
    ]);
    setTimeout(() => {
      if (current + 1 < questions.length) {
        setCurrent((c) => c + 1);
        setSelected(null);
        setTimer(30);
        setTimedOut(false);
      } else {
        setFinished(true);
        const newScore = ok ? score + 1 : score;
        if (newScore > bestScore) {
          setBestScore(newScore);
          localStorage.setItem("quiz_best", newScore);
        }
      }
    }, 1200);
  };

  const pct = finished ? Math.round((score / questions.length) * 100) : 0;
  const grade =
    pct >= 90
      ? "🏆 Expert"
      : pct >= 70
        ? "🎯 Proficient"
        : pct >= 50
          ? "📚 Learning"
          : "🔄 Keep Practicing";

  if (!started) {
    return (
      <div
        className="page-wrapper"
        style={{ background: "var(--bg-deep)", minHeight: "100vh" }}
      >
        <div className="bg-grid" />
        <div
          className="bg-glow-orb"
          style={{
            width: 500,
            height: 500,
            background:
              "radial-gradient(circle, rgba(162,155,254,0.1) 0%, transparent 70%)",
            top: -100,
            left: -100,
          }}
        />
        <NavBar />
        <div
          style={{
            maxWidth: 640,
            margin: "0 auto",
            padding: "80px 24px 60px",
            textAlign: "center",
          }}
        >
          <div className="animate-fadeInUp">
            <div style={{ fontSize: 64, marginBottom: 20 }}>🧠</div>
            <div className="section-tag" style={{ justifyContent: "center" }}>
              Subnetting Quiz
            </div>
            <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 16 }}>
              Test Your Skills
            </h1>
            <p
              style={{
                fontSize: 14,
                color: "var(--text-secondary)",
                lineHeight: 1.8,
                marginBottom: 32,
              }}
            >
              10 questions covering IP classes, subnet masks, VLSM, wildcard
              masks, CIDR notation, and network calculations. 30 seconds per
              question.
            </p>
            <div
              className="card"
              style={{
                padding: 28,
                marginBottom: 28,
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 16,
              }}
            >
              {[
                { label: "Questions", value: "10" },
                { label: "Time/Q", value: "30s" },
                { label: "Best Score", value: `${bestScore}/10` },
              ].map((s) => (
                <div key={s.label} className="stat-card">
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                className="btn-primary"
                onClick={startQuiz}
                style={{ fontSize: 15, padding: "16px 40px" }}
              >
                Start Quiz →
              </button>
              <Link
                to="/"
                className="btn-secondary"
                style={{
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                Home
              </Link>
            </div>
          </div>
        </div>
        <footer className="app-footer">
          Made with ♥ by{" "}
          <a
            href="https://github.com/hafiz-sakib"
            target="_blank"
            rel="noopener noreferrer"
          >
            Mohammad Hafizur Rahman Sakib
          </a>
        </footer>
      </div>
    );
  }

  if (finished) {
    return (
      <div
        className="page-wrapper"
        style={{ background: "var(--bg-deep)", minHeight: "100vh" }}
      >
        <div className="bg-grid" />
        <NavBar />
        <div
          style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px 60px" }}
        >
          <div
            className="animate-fadeInUp"
            style={{ textAlign: "center", marginBottom: 36 }}
          >
            <div style={{ fontSize: 56, marginBottom: 12 }}>
              {pct >= 70 ? "🎉" : "📖"}
            </div>
            <h1 style={{ fontSize: 36, fontWeight: 800 }}>{grade}</h1>
            <p style={{ color: "var(--text-secondary)", marginTop: 8 }}>
              Quiz complete — {score}/{questions.length} correct ({pct}%)
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))",
              gap: 12,
              marginBottom: 28,
            }}
          >
            {[
              { label: "Score", value: `${score}/${questions.length}` },
              { label: "Percentage", value: `${pct}%` },
              { label: "Best Score", value: `${bestScore}/10` },
            ].map((s) => (
              <div key={s.label} className="stat-card">
                <div
                  className="stat-value"
                  style={{ color: pct >= 70 ? "var(--cyan)" : "var(--gold)" }}
                >
                  {s.value}
                </div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginBottom: 28,
            }}
          >
            {answers.map((a, i) => (
              <div
                key={i}
                className="card"
                style={{
                  padding: 20,
                  borderColor: a.ok
                    ? "rgba(6,214,160,0.2)"
                    : "rgba(239,68,68,0.2)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span
                    className={`badge ${a.ok ? "badge-cyan" : "badge-pink"}`}
                  >
                    {a.ok ? "✓ Correct" : "✗ Wrong"}
                  </span>
                  <span
                    style={{
                      fontFamily: "Syne, sans-serif",
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      color: "var(--text-muted)",
                    }}
                  >
                    {a.category}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--text-primary)",
                    marginBottom: 6,
                    fontFamily: "Syne, sans-serif",
                    fontWeight: 600,
                  }}
                >
                  Q{i + 1}. {a.q}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    marginBottom: 6,
                  }}
                >
                  Your answer:{" "}
                  <span style={{ color: a.ok ? "var(--cyan)" : "#f87171" }}>
                    {a.selected}
                  </span>
                  {!a.ok && (
                    <>
                      {" "}
                      · Correct:{" "}
                      <span style={{ color: "var(--cyan)" }}>{a.correct}</span>
                    </>
                  )}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    background: "rgba(255,255,255,0.03)",
                    padding: "8px 12px",
                    borderRadius: 6,
                    borderLeft: `2px solid ${a.ok ? "var(--cyan)" : "var(--gold)"}`,
                  }}
                >
                  {a.explanation}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="btn-primary" onClick={startQuiz}>
              Retry Quiz
            </button>
            <Link
              to="/"
              className="btn-secondary"
              style={{
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Home
            </Link>
          </div>
        </div>
        <footer className="app-footer">
          Made with ♥ by{" "}
          <a
            href="https://github.com/hafiz-sakib"
            target="_blank"
            rel="noopener noreferrer"
          >
            Mohammad Hafizur Rahman Sakib
          </a>
        </footer>
      </div>
    );
  }

  const q = questions[current];
  const timerPct = (timer / 30) * 100;
  const timerColor =
    timer > 15 ? "var(--cyan)" : timer > 7 ? "var(--gold)" : "#f87171";

  return (
    <div
      className="page-wrapper"
      style={{ background: "var(--bg-deep)", minHeight: "100vh" }}
    >
      <div className="bg-grid" />
      <NavBar />
      <div
        style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px 60px" }}
      >
        {/* Progress */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <span
            style={{
              fontFamily: "DM Mono, monospace",
              fontSize: 12,
              color: "var(--text-muted)",
            }}
          >
            Question {current + 1} of {questions.length}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                fontFamily: "Syne, sans-serif",
                fontSize: 11,
                fontWeight: 700,
                color: "var(--text-muted)",
              }}
            >
              Score: {score}
            </span>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: `conic-gradient(${timerColor} ${timerPct}%, rgba(255,255,255,0.05) 0)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontFamily: "DM Mono, monospace",
                color: timerColor,
                fontWeight: 700,
              }}
            >
              {timer}
            </div>
          </div>
        </div>
        <div
          style={{
            height: 4,
            background: "var(--border-subtle)",
            borderRadius: 2,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              height: "100%",
              background: "var(--gold)",
              borderRadius: 2,
              width: `${(current / questions.length) * 100}%`,
              transition: "width 0.3s",
            }}
          />
        </div>

        <div
          className="card animate-fadeInUp"
          style={{ padding: 32, marginBottom: 20 }}
        >
          <div style={{ marginBottom: 8 }}>
            <span
              style={{
                fontSize: 10,
                fontFamily: "Syne, sans-serif",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: categoryColors[q.category] || "var(--gold)",
              }}
            >
              {q.category}
            </span>
          </div>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              lineHeight: 1.4,
              marginBottom: 28,
              color: "var(--text-primary)",
            }}
          >
            {q.q}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {q.options.map((opt, i) => {
              let cls = "quiz-option";
              if (selected !== null) {
                if (opt === q.answer) cls += " correct";
                else if (opt === selected && opt !== q.answer)
                  cls += " incorrect";
              }

              return (
                <button
                  key={`${current}-${i}`} // ✅ FIXED
                  className={cls}
                  onClick={() => handleSelect(opt)}
                  disabled={selected !== null}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {timedOut && (
            <div className="error-msg" style={{ marginTop: 14 }}>
              ⏱ Time's up! The answer was: {q.answer}
            </div>
          )}
        </div>
      </div>
      <footer className="app-footer">
        Made with ♥ by{" "}
        <a
          href="https://github.com/hafiz-sakib"
          target="_blank"
          rel="noopener noreferrer"
        >
          Mohammad Hafizur Rahman Sakib
        </a>
      </footer>
    </div>
  );
}
