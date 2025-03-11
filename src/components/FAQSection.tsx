import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, Container } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const faqs = [
    { question: "What services are included in assisted living?", answer: "Assisted living typically includes personal care assistance, medication management, meal preparation, housekeeping, laundry services, and social activities. Some facilities may also offer specialized care for memory-related conditions." },
    { question: "How do I know if assisted living is the right choice for my loved one?", answer: "Assisted living is ideal for seniors who need help with daily activities but still want to maintain independence. If your loved one struggles with bathing, dressing, meal preparation, or medication management, but does not require full-time medical care, assisted living may be a great option." },
    { question: "Can residents bring their own furniture and personal belongings?", answer: "Yes! Most assisted living facilities encourage residents to bring familiar furniture, decor, and personal belongings to make their new living space feel like home. Some facilities may provide furnished rooms, but customization is always welcome." },
    { question: "Are visitors allowed, and what are the visiting hours?", answer: "Absolutely! Most assisted living communities have open visiting hours, though some may have designated times to ensure a peaceful environment for residents. Always check with the facility for specific visitor policies." },
    { question: "How is healthcare managed in an assisted living facility?", answer: "Assisted living facilities typically provide medication management, routine health checkups, and coordination with outside healthcare providers. While they do not offer intensive medical care, many have on-site nurses and emergency response systems for residents' safety." }
];

export default function FAQSection() {
    return (
        <Box id="faq" sx={{ width: "100%", mt: 6, px: 2, textAlign: "center", py: 5 }}>
            <Container maxWidth="lg">
                <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
                    Frequently Asked Questions
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ maxWidth: "800px", mx: "auto", mb: 3 }}>
                    Here are some of the most common questions about assisted living facilities.
                </Typography>

                {/* FAQ Items */}
                {faqs.map((faq, index) => (
                    <Accordion key={index} sx={{ mb: 2 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">{faq.question}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography variant="body1" color="textSecondary">{faq.answer}</Typography>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Container>
        </Box>
    );
}
