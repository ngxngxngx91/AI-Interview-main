import {jsPDF} from "jspdf";

export const generateSessionPDF = (sessionData) => {
    const doc = new jsPDF();
    let yPos = 20;

    // Title
    doc.setFontSize(20);
    doc.text(sessionData.scenario.title, 20, yPos);
    yPos += 15;

    // Session Info
    doc.setFontSize(12);
    doc.text(`Duration: ${Math.floor(sessionData.duration / 60)}m ${sessionData.duration % 60}s`, 20, yPos);
    yPos += 10;
    doc.text(`Difficulty: ${sessionData.scenario.difficulty || "Medium"}`, 20, yPos);
    yPos += 10;
    doc.text(`Messages: ${sessionData.conversation.length}`, 20, yPos);
    yPos += 15;

    // Scenario Description
    doc.setFontSize(14);
    doc.text("Scenario Description", 20, yPos);
    yPos += 10;
    doc.setFontSize(12);
    const splitDesc = doc.splitTextToSize(sessionData.scenario.scenario, 170);
    doc.text(splitDesc, 20, yPos);
    yPos += splitDesc.length * 7 + 15;

    // Conversation
    doc.setFontSize(14);
    doc.text("Conversation History", 20, yPos);
    yPos += 10;
    doc.setFontSize(12);

    sessionData.conversation.forEach((message) => {
        const role = message.type === "user" ? "You" : "AI";
        const text = `${role}: ${message.content}`;
        const splitText = doc.splitTextToSize(text, 170);

        if (yPos + splitText.length * 7 > 280) {
            doc.addPage();
            yPos = 20;
        }

        doc.text(splitText, 20, yPos);
        yPos += splitText.length * 7 + 5;
    });

    // Feedback
    doc.addPage();
    yPos = 20;
    doc.setFontSize(14);
    doc.text("AI Feedback & Analysis", 20, yPos);
    yPos += 15;

    // Strengths
    doc.setFontSize(12);
    doc.text("Strengths:", 20, yPos);
    yPos += 10;
    const strengths = [
        "Clear explanation of technical concepts",
        "Professional communication style",
        "Good problem-solving approach"
    ];
    strengths.forEach((strength) => {
        doc.text(`• ${strength}`, 30, yPos);
        yPos += 7;
    });
    yPos += 5;

    // Areas for Improvement
    doc.text("Areas for Improvement:", 20, yPos);
    yPos += 10;
    const improvements = [
        "Reduce filler words (um, uh, like)",
        "Provide more specific examples",
        "Work on response timing"
    ];
    improvements.forEach((improvement) => {
        doc.text(`• ${improvement}`, 30, yPos);
        yPos += 7;
    });
    yPos += 5;

    // Recommendations
    doc.text("Recommendations:", 20, yPos);
    yPos += 10;
    const recommendations = [
        "Practice speaking more slowly and clearly",
        "Prepare more concrete examples for common questions",
        "Work on reducing nervous habits",
        "Focus on active listening skills"
    ];
    recommendations.forEach((rec) => {
        doc.text(`• ${rec}`, 30, yPos);
        yPos += 7;
    });

    // Save the PDF
    doc.save(`interview-feedback-${new Date().toISOString().split('T')[0]}.pdf`);
}; 