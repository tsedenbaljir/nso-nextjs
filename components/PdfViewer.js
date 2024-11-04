// components/PdfEmbed.js
const PdfEmbed = ({ pdfUrl }) => {
    return (
        <div className="w-full h-[800px] overflow-hidden">
            <embed
                src={pdfUrl}
                type="application/pdf"
                width="100%"
                height="100%"
            />
        </div>
    );
};

export default PdfEmbed;
