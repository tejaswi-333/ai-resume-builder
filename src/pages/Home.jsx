import React from "react";
import ReactMarkdown from "react-markdown";
import {useState} from "react";

function renderGeminiResponse(response) {
    const lines = response.split("\n");
    const content = [];
    let listItems = [];

    function flushList() {
        if (listItems.length > 0) {
            content.push(
                <ul key={`list-${content.length}`}>
                    {listItems.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
                </ul>
            );
            listItems = [];
        }
    }

    lines.forEach((line, index) => {
        const trimmedLine = line.trim();

        if (!trimmedLine) {
            flushList();
            return;
        }

        const sectionHeading = trimmedLine.match(/^\d+\.\s+(.+)$/);
        const listItem = trimmedLine.match(/^(?:[-*]|\d+[.)])\s+(.*)$/);
        if (sectionHeading) {
            flushList();
            content.push(<h3 key={`heading-${index}`}>{sectionHeading[1]}</h3>);
            return;
        }

        if (listItem) {
            listItems.push(listItem[1]);
            return;
        }

        flushList();

        if (/^#{1,3}\s+/.test(trimmedLine)) {
            content.push(<h4 key={`subheading-${index}`}>{trimmedLine.replace(/^#{1,3}\s+/, "")}</h4>);
        } else {
            content.push(<p key={`paragraph-${index}`}>{trimmedLine}</p>);
        }
    });

    flushList();
    return content;
}

function HomePage(){
    const[formData, setFormData] = useState({
        companyName: "",
        applyingAsA: "Fresher",
        coverLetterTone: "Formal",
        jobDescription: "",
        currentResume: ""
    })

    const [geminiResponse, setGeminiResponse] = useState("");

    async function handleGenerateData() {
    console.log("Form Data: ", formData);

    const prompt = `
You are a professional career coach and resume optimization expert.

Your task is to generate:
1. A personalized cover letter
2. Improved resume content
3. Keyword match analysis
4. ATS score estimate

Inputs:

Company Name: ${formData.companyName}

Experience Level: ${formData.applyingAsA}

Job Description:
${formData.jobDescription}

Current Resume:
${formData.currentResume || "No resume provided"}

Preferred Tone:
${formData.coverLetterTone}

Output format:

1. Tailored Cover Letter
Write a professional cover letter addressed to ${formData.companyName}.
Use the specified tone: ${formData.coverLetterTone}.
Highlight relevant skills and experiences based on the job description.

2. Updated Resume Content
Suggest an optimized resume summary, bullet points, and skills tailored to the job description.
Make the content concise, achievement-focused, and ATS-friendly.

3. Keyword Match Analysis
Extract the most important keywords from the job description.
Check whether they exist in the provided resume.
List missing keywords that should be added.

4. ATS Score Estimate
Provide a rough ATS match score from 0 to 100.
Briefly explain the reasoning.

Make the response structured, clear, and easy to display in a React application.
`;

    try {
        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": import.meta.env.VITE_GEMINI_API_KEY
                },

                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        console.log("Gemini Response:", data);

        if (!response.ok) {
            console.error("Gemini API Error:", data);
            return;
        }

        const generatedText =
            data.candidates?.[0]?.content?.parts?.[0]?.text;

        console.log("Generated Gemini data:", generatedText);
        setGeminiResponse(generatedText);

    } catch (error) {
        console.error("Error:", error);
    }
}
    return(
        <main className="page-shell">
            <header className="page-header">
                <div className="eyebrow">Career toolkit</div>
                <h1>Build a resume that gets noticed.</h1>
                <p>Shape your experience around the role and let your application do the talking.</p>
            </header>

            <div className="workspace-grid">
                <section className="form-panel" id="details" aria-labelledby="form-title">
                    <div className="panel-heading">
                        <span className="step-label">01 / Details</span>
                        <h2 id="form-title">Tell us about the role</h2>
                        <p>A little context helps create a more relevant application.</p>
                    </div>
                    <form>
                        <div className="field-row">
                            <div className="field-group">
                                <label htmlFor="exampleInputEmail1">Company Name</label>
                                <input type="text" id="exampleInputEmail1" value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})} placeholder="e.g. Acme Inc." />
                                <span>Who are you applying to?</span>
                            </div>

                            <div className="field-group">
                                <label htmlFor="applyingAsA">Applying as</label>
                                <select id="applyingAsA" value={formData.applyingAsA} onChange={(e) => setFormData({...formData, applyingAsA: e.target.value})}>
                                    <option value="Fresher">Fresher</option>
                                    <option value="Experienced">Experienced</option>
                                </select>
                                <span>Your experience level</span>
                            </div>
                        </div>

                        <div className="field-group">
                            <label htmlFor="coverLetterTone">Cover letter tone</label>
                            <select id="coverLetterTone" value={formData.coverLetterTone} onChange={(e) => setFormData({...formData, coverLetterTone: e.target.value})}>
                                <option value="Formal">Formal</option>
                                <option value="Informal">Informal</option>
                                <option value="Casual">Casual</option>
                            </select>
                        </div>

                        <div className="field-group">
                            <label htmlFor="jobDescription">Job description</label>
                            <textarea id="jobDescription" rows="7" value={formData.jobDescription} onChange={(e) => setFormData({...formData, jobDescription: e.target.value})} placeholder="Paste the role description here..." />
                        </div>

                        <div className="field-group">
                            <label htmlFor="currentResume">Current resume <em>Optional</em></label>
                            <textarea id="currentResume" rows="7" value={formData.currentResume} onChange={(e) => setFormData({...formData, currentResume: e.target.value})} placeholder="Paste your current resume here..." />
                        </div>

                        <button type="button" className="generate-button" onClick={handleGenerateData}>Generate application <span aria-hidden="true">&#8594;</span></button>
                    </form>
                </section>

                <aside className="preview-panel" id="output">
                    <div className="preview-mark" aria-hidden="true">✦</div>
                    <span className="step-label">02 / Your output</span>
                    <h2>Make your next move count.</h2>
                    <p>Your tailored cover letter, resume improvements, keyword analysis, and ATS estimate will appear here.</p>
                    <div className="preview-lines" aria-hidden="true"><span></span><span></span><span></span></div>
                </aside>
            </div>

            {geminiResponse && (
                <section className="gemini-response" aria-labelledby="gemini-response-title">
                    <div className="response-header">
                        <div>
                            <span className="step-label">03 / Refined application</span>
                            <h2 id="gemini-response-title">Gemini Response</h2>
                        </div>
                        <span className="response-status">Ready to review</span>
                    </div>
                    <div className="response-content">
                        <ReactMarkdown>
                            {geminiResponse}
                        </ReactMarkdown>
                    </div>
                </section>
            )}
        </main>
    )
}
export default HomePage
