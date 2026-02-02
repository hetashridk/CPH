import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, ArrowRight, CheckCircle, Image as ImageIcon, Loader2 } from 'lucide-react';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx3nMetSrC75mOSv9TE37kcJ-v46Q1z92TSAXpI8tCd6bvWvL-FIDsJROM2Oy-Or5If/exec";

const countryOptions = [
    { code: '+93', label: 'AF (+93)', min: 9, max: 9 },
    { code: '+355', label: 'AL (+355)', min: 9, max: 9 },
    { code: '+213', label: 'DZ (+213)', min: 9, max: 9 },
    { code: '+1684', label: 'AS (+1684)', min: 7, max: 7 },
    { code: '+376', label: 'AD (+376)', min: 6, max: 6 },
    { code: '+244', label: 'AO (+244)', min: 9, max: 9 },
    { code: '+1264', label: 'AI (+1264)', min: 7, max: 7 },
    { code: '+1268', label: 'AG (+1268)', min: 7, max: 7 },
    { code: '+54', label: 'AR (+54)', min: 10, max: 10 },
    { code: '+374', label: 'AM (+374)', min: 8, max: 8 },
    { code: '+297', label: 'AW (+297)', min: 7, max: 7 },
    { code: '+61', label: 'AU (+61)', min: 9, max: 9 },
    { code: '+43', label: 'AT (+43)', min: 4, max: 13 },
    { code: '+994', label: 'AZ (+994)', min: 9, max: 9 },
    { code: '+1242', label: 'BS (+1242)', min: 7, max: 7 },
    { code: '+973', label: 'BH (+973)', min: 8, max: 8 },
    { code: '+880', label: 'BD (+880)', min: 10, max: 10 },
    { code: '+1246', label: 'BB (+1246)', min: 7, max: 7 },
    { code: '+375', label: 'BY (+375)', min: 9, max: 9 },
    { code: '+32', label: 'BE (+32)', min: 9, max: 9 },
    { code: '+501', label: 'BZ (+501)', min: 7, max: 7 },
    { code: '+229', label: 'BJ (+229)', min: 8, max: 8 },
    { code: '+1441', label: 'BM (+1441)', min: 7, max: 7 },
    { code: '+975', label: 'BT (+975)', min: 8, max: 8 },
    { code: '+591', label: 'BO (+591)', min: 8, max: 8 },
    { code: '+387', label: 'BA (+387)', min: 8, max: 8 },
    { code: '+267', label: 'BW (+267)', min: 7, max: 7 },
    { code: '+55', label: 'BR (+55)', min: 10, max: 11 },
    { code: '+673', label: 'BN (+673)', min: 7, max: 7 },
    { code: '+359', label: 'BG (+359)', min: 7, max: 9 },
    { code: '+226', label: 'BF (+226)', min: 8, max: 8 },
    { code: '+257', label: 'BI (+257)', min: 8, max: 8 },
    { code: '+855', label: 'KH (+855)', min: 8, max: 9 },
    { code: '+237', label: 'CM (+237)', min: 9, max: 9 },
    { code: '+1', label: 'CA (+1)', min: 10, max: 10 },
    { code: '+238', label: 'CV (+238)', min: 7, max: 7 },
    { code: '+1345', label: 'KY (+1345)', min: 7, max: 7 },
    { code: '+236', label: 'CF (+236)', min: 8, max: 8 },
    { code: '+235', label: 'TD (+235)', min: 8, max: 8 },
    { code: '+56', label: 'CL (+56)', min: 9, max: 9 },
    { code: '+86', label: 'CN (+86)', min: 11, max: 11 },
    { code: '+61', label: 'CX (+61)', min: 9, max: 9 },
    { code: '+61', label: 'CC (+61)', min: 9, max: 9 },
    { code: '+57', label: 'CO (+57)', min: 10, max: 10 },
    { code: '+269', label: 'KM (+269)', min: 7, max: 7 },
    { code: '+242', label: 'CG (+242)', min: 9, max: 9 },
    { code: '+243', label: 'CD (+243)', min: 9, max: 9 },
    { code: '+682', label: 'CK (+682)', min: 5, max: 5 },
    { code: '+506', label: 'CR (+506)', min: 8, max: 8 },
    { code: '+385', label: 'HR (+385)', min: 8, max: 9 },
    { code: '+53', label: 'CU (+53)', min: 8, max: 8 },
    { code: '+357', label: 'CY (+357)', min: 8, max: 8 },
    { code: '+420', label: 'CZ (+420)', min: 9, max: 9 },
    { code: '+45', label: 'DK (+45)', min: 8, max: 8 },
    { code: '+253', label: 'DJ (+253)', min: 8, max: 8 },
    { code: '+1767', label: 'DM (+1767)', min: 7, max: 7 },
    { code: '+1809', label: 'DO (+1809)', min: 7, max: 7 },
    { code: '+1829', label: 'DO (+1829)', min: 7, max: 7 },
    { code: '+1849', label: 'DO (+1849)', min: 7, max: 7 },
    { code: '+593', label: 'EC (+593)', min: 9, max: 9 },
    { code: '+20', label: 'EG (+20)', min: 10, max: 10 },
    { code: '+503', label: 'SV (+503)', min: 8, max: 8 },
    { code: '+240', label: 'GQ (+240)', min: 9, max: 9 },
    { code: '+291', label: 'ER (+291)', min: 7, max: 7 },
    { code: '+372', label: 'EE (+372)', min: 7, max: 8 },
    { code: '+251', label: 'ET (+251)', min: 9, max: 9 },
    { code: '+500', label: 'FK (+500)', min: 5, max: 5 },
    { code: '+298', label: 'FO (+298)', min: 6, max: 6 },
    { code: '+679', label: 'FJ (+679)', min: 7, max: 7 },
    { code: '+358', label: 'FI (+358)', min: 5, max: 12 },
    { code: '+33', label: 'FR (+33)', min: 9, max: 9 },
    { code: '+594', label: 'GF (+594)', min: 9, max: 9 },
    { code: '+689', label: 'PF (+689)', min: 6, max: 6 },
    { code: '+241', label: 'GA (+241)', min: 7, max: 7 },
    { code: '+220', label: 'GM (+220)', min: 7, max: 7 },
    { code: '+995', label: 'GE (+995)', min: 9, max: 9 },
    { code: '+49', label: 'DE (+49)', min: 6, max: 13 },
    { code: '+233', label: 'GH (+233)', min: 9, max: 9 },
    { code: '+350', label: 'GI (+350)', min: 8, max: 8 },
    { code: '+30', label: 'GR (+30)', min: 10, max: 10 },
    { code: '+299', label: 'GL (+299)', min: 6, max: 6 },
    { code: '+1473', label: 'GD (+1473)', min: 7, max: 7 },
    { code: '+590', label: 'GP (+590)', min: 9, max: 9 },
    { code: '+1671', label: 'GU (+1671)', min: 7, max: 7 },
    { code: '+502', label: 'GT (+502)', min: 8, max: 8 },
    { code: '+224', label: 'GN (+224)', min: 9, max: 9 },
    { code: '+245', label: 'GW (+245)', min: 7, max: 7 },
    { code: '+592', label: 'GY (+592)', min: 7, max: 7 },
    { code: '+509', label: 'HT (+509)', min: 8, max: 8 },
    { code: '+39', label: 'VA (+39)', min: 6, max: 11 },
    { code: '+504', label: 'HN (+504)', min: 8, max: 8 },
    { code: '+852', label: 'HK (+852)', min: 8, max: 8 },
    { code: '+36', label: 'HU (+36)', min: 9, max: 9 },
    { code: '+354', label: 'IS (+354)', min: 7, max: 9 },
    { code: '+91', label: 'IN (+91)', min: 10, max: 10 },
    { code: '+62', label: 'ID (+62)', min: 9, max: 12 },
    { code: '+98', label: 'IR (+98)', min: 10, max: 10 },
    { code: '+964', label: 'IQ (+964)', min: 10, max: 10 },
    { code: '+353', label: 'IE (+353)', min: 9, max: 9 },
    { code: '+972', label: 'IL (+972)', min: 9, max: 9 },
    { code: '+39', label: 'IT (+39)', min: 6, max: 11 },
    { code: '+225', label: 'CI (+225)', min: 8, max: 8 },
    { code: '+1876', label: 'JM (+1876)', min: 7, max: 7 },
    { code: '+81', label: 'JP (+81)', min: 10, max: 10 },
    { code: '+962', label: 'JO (+962)', min: 9, max: 9 },
    { code: '+7', label: 'KZ (+7)', min: 10, max: 10 },
    { code: '+254', label: 'KE (+254)', min: 9, max: 9 },
    { code: '+686', label: 'KI (+686)', min: 8, max: 8 },
    { code: '+965', label: 'KW (+965)', min: 8, max: 8 },
    { code: '+996', label: 'KG (+996)', min: 9, max: 9 },
    { code: '+856', label: 'LA (+856)', min: 8, max: 10 },
    { code: '+371', label: 'LV (+371)', min: 8, max: 8 },
    { code: '+961', label: 'LB (+961)', min: 7, max: 8 },
    { code: '+266', label: 'LS (+266)', min: 8, max: 8 },
    { code: '+231', label: 'LR (+231)', min: 7, max: 7 },
    { code: '+218', label: 'LY (+218)', min: 9, max: 9 },
    { code: '+423', label: 'LI (+423)', min: 7, max: 7 },
    { code: '+370', label: 'LT (+370)', min: 8, max: 8 },
    { code: '+352', label: 'LU (+352)', min: 9, max: 9 },
    { code: '+853', label: 'MO (+853)', min: 8, max: 8 },
    { code: '+389', label: 'MK (+389)', min: 8, max: 8 },
    { code: '+261', label: 'MG (+261)', min: 9, max: 9 },
    { code: '+265', label: 'MW (+265)', min: 8, max: 9 },
    { code: '+60', label: 'MY (+60)', min: 9, max: 10 },
    { code: '+960', label: 'MV (+960)', min: 7, max: 7 },
    { code: '+223', label: 'ML (+223)', min: 8, max: 8 },
    { code: '+356', label: 'MT (+356)', min: 8, max: 8 },
    { code: '+692', label: 'MH (+692)', min: 7, max: 7 },
    { code: '+596', label: 'MQ (+596)', min: 9, max: 9 },
    { code: '+222', label: 'MR (+222)', min: 8, max: 8 },
    { code: '+230', label: 'MU (+230)', min: 7, max: 7 },
    { code: '+262', label: 'YT (+262)', min: 9, max: 9 },
    { code: '+52', label: 'MX (+52)', min: 10, max: 10 },
    { code: '+691', label: 'FM (+691)', min: 7, max: 7 },
    { code: '+373', label: 'MD (+373)', min: 8, max: 8 },
    { code: '+377', label: 'MC (+377)', min: 8, max: 9 },
    { code: '+976', label: 'MN (+976)', min: 8, max: 8 },
    { code: '+382', label: 'ME (+382)', min: 8, max: 8 },
    { code: '+1664', label: 'MS (+1664)', min: 7, max: 7 },
    { code: '+212', label: 'MA (+212)', min: 9, max: 9 },
    { code: '+258', label: 'MZ (+258)', min: 9, max: 9 },
    { code: '+95', label: 'MM (+95)', min: 7, max: 10 },
    { code: '+264', label: 'NA (+264)', min: 9, max: 9 },
    { code: '+674', label: 'NR (+674)', min: 7, max: 7 },
    { code: '+977', label: 'NP (+977)', min: 10, max: 10 },
    { code: '+31', label: 'NL (+31)', min: 9, max: 9 },
    { code: '+599', label: 'AN (+599)', min: 7, max: 7 },
    { code: '+687', label: 'NC (+687)', min: 6, max: 6 },
    { code: '+64', label: 'NZ (+64)', min: 8, max: 10 },
    { code: '+505', label: 'NI (+505)', min: 8, max: 8 },
    { code: '+227', label: 'NE (+227)', min: 8, max: 8 },
    { code: '+234', label: 'NG (+234)', min: 10, max: 10 },
    { code: '+683', label: 'NU (+683)', min: 4, max: 4 },
    { code: '+672', label: 'NF (+672)', min: 6, max: 6 },
    { code: '+850', label: 'KP (+850)', min: 8, max: 11 },
    { code: '+1670', label: 'MP (+1670)', min: 7, max: 7 },
    { code: '+47', label: 'NO (+47)', min: 8, max: 8 },
    { code: '+968', label: 'OM (+968)', min: 8, max: 8 },
    { code: '+92', label: 'PK (+92)', min: 10, max: 10 },
    { code: '+680', label: 'PW (+680)', min: 7, max: 7 },
    { code: '+970', label: 'PS (+970)', min: 9, max: 9 },
    { code: '+507', label: 'PA (+507)', min: 7, max: 8 },
    { code: '+675', label: 'PG (+675)', min: 9, max: 9 },
    { code: '+595', label: 'PY (+595)', min: 9, max: 9 },
    { code: '+51', label: 'PE (+51)', min: 9, max: 9 },
    { code: '+63', label: 'PH (+63)', min: 10, max: 10 },
    { code: '+48', label: 'PL (+48)', min: 9, max: 9 },
    { code: '+351', label: 'PT (+351)', min: 9, max: 9 },
    { code: '+1787', label: 'PR (+1787)', min: 7, max: 7 },
    { code: '+1939', label: 'PR (+1939)', min: 7, max: 7 },
    { code: '+974', label: 'QA (+974)', min: 8, max: 8 },
    { code: '+40', label: 'RO (+40)', min: 10, max: 10 },
    { code: '+7', label: 'RU (+7)', min: 10, max: 10 },
    { code: '+250', label: 'RW (+250)', min: 9, max: 9 },
    { code: '+262', label: 'RE (+262)', min: 9, max: 9 },
    { code: '+590', label: 'BL (+590)', min: 9, max: 9 },
    { code: '+290', label: 'SH (+290)', min: 4, max: 4 },
    { code: '+1869', label: 'KN (+1869)', min: 7, max: 7 },
    { code: '+1758', label: 'LC (+1758)', min: 7, max: 7 },
    { code: '+590', label: 'MF (+590)', min: 9, max: 9 },
    { code: '+508', label: 'PM (+508)', min: 6, max: 6 },
    { code: '+1784', label: 'VC (+1784)', min: 7, max: 7 },
    { code: '+685', label: 'WS (+685)', min: 7, max: 7 },
    { code: '+378', label: 'SM (+378)', min: 6, max: 10 },
    { code: '+239', label: 'ST (+239)', min: 7, max: 7 },
    { code: '+966', label: 'SA (+966)', min: 9, max: 9 },
    { code: '+221', label: 'SN (+221)', min: 9, max: 9 },
    { code: '+381', label: 'RS (+381)', min: 8, max: 9 },
    { code: '+248', label: 'SC (+248)', min: 7, max: 7 },
    { code: '+232', label: 'SL (+232)', min: 8, max: 8 },
    { code: '+65', label: 'SG (+65)', min: 8, max: 8 },
    { code: '+421', label: 'SK (+421)', min: 9, max: 9 },
    { code: '+386', label: 'SI (+386)', min: 8, max: 8 },
    { code: '+677', label: 'SB (+677)', min: 7, max: 7 },
    { code: '+252', label: 'SO (+252)', min: 8, max: 8 },
    { code: '+27', label: 'ZA (+27)', min: 9, max: 10 },
    { code: '+82', label: 'KR (+82)', min: 9, max: 11 },
    { code: '+34', label: 'ES (+34)', min: 9, max: 9 },
    { code: '+94', label: 'LK (+94)', min: 9, max: 9 },
    { code: '+249', label: 'SD (+249)', min: 9, max: 9 },
    { code: '+597', label: 'SR (+597)', min: 6, max: 7 },
    { code: '+47', label: 'SJ (+47)', min: 8, max: 8 },
    { code: '+268', label: 'SZ (+268)', min: 8, max: 8 },
    { code: '+46', label: 'SE (+46)', min: 7, max: 13 },
    { code: '+41', label: 'CH (+41)', min: 9, max: 9 },
    { code: '+963', label: 'SY (+963)', min: 8, max: 9 },
    { code: '+886', label: 'TW (+886)', min: 9, max: 9 },
    { code: '+992', label: 'TJ (+992)', min: 9, max: 9 },
    { code: '+255', label: 'TZ (+255)', min: 9, max: 9 },
    { code: '+66', label: 'TH (+66)', min: 9, max: 9 },
    { code: '+670', label: 'TL (+670)', min: 8, max: 8 },
    { code: '+228', label: 'TG (+228)', min: 8, max: 8 },
    { code: '+690', label: 'TK (+690)', min: 4, max: 4 },
    { code: '+676', label: 'TO (+676)', min: 5, max: 7 },
    { code: '+1868', label: 'TT (+1868)', min: 7, max: 7 },
    { code: '+216', label: 'TN (+216)', min: 8, max: 8 },
    { code: '+90', label: 'TR (+90)', min: 10, max: 10 },
    { code: '+993', label: 'TM (+993)', min: 8, max: 8 },
    { code: '+1649', label: 'TC (+1649)', min: 7, max: 7 },
    { code: '+688', label: 'TV (+688)', min: 5, max: 6 },
    { code: '+256', label: 'UG (+256)', min: 9, max: 9 },
    { code: '+380', label: 'UA (+380)', min: 9, max: 9 },
    { code: '+971', label: 'UAE (+971)', min: 9, max: 9 },
    { code: '+44', label: 'UK (+44)', min: 10, max: 11 },
    { code: '+1', label: 'US (+1)', min: 10, max: 10 },
    { code: '+598', label: 'UY (+598)', min: 8, max: 9 },
    { code: '+998', label: 'UZ (+998)', min: 9, max: 9 },
    { code: '+678', label: 'VU (+678)', min: 7, max: 7 },
    { code: '+58', label: 'VE (+58)', min: 10, max: 10 },
    { code: '+84', label: 'VN (+84)', min: 9, max: 9 },
    { code: '+1284', label: 'VG (+1284)', min: 7, max: 7 },
    { code: '+1340', label: 'VI (+1340)', min: 7, max: 7 },
    { code: '+681', label: 'WF (+681)', min: 6, max: 6 },
    { code: '+967', label: 'YE (+967)', min: 9, max: 9 },
    { code: '+260', label: 'ZM (+260)', min: 9, max: 9 },
    { code: '+263', label: 'ZW (+263)', min: 9, max: 9 },
    { code: 'other', label: 'Other', min: 8, max: 15 }
];

const FreeSampleModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState('upload'); // 'upload', 'form', 'success'
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        companyName: '',
        email: '',
        phone: '',
        countryCode: '+91',
        styleInstructions: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({ name: null, companyName: null, email: null, phone: null });

    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const selectedFile = e.dataTransfer.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Helper to call Google Script
    const callGoogleScript = async (extraData = {}) => {
        const payload = {
            ...formData,
            phone: `${formData.countryCode} ${formData.phone}`, // Combine for sheet
            submissionType: 'FreeSample',
            ...extraData
        };

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify(payload),
            headers: { "Content-Type": "text/plain;charset=utf-8" },
        });

        if (!response.ok) throw new Error(`Google Script Error: ${response.status}`);
        const result = await response.json();
        if (result.result === 'error') throw new Error(result.error);
        return result;
    };

    // Validation Helper
    // Validation Helper
    const validateForm = () => {
        let valid = true;
        const newErrors = { name: null, companyName: null, email: null, phone: null };

        // Name Validation
        if (!formData.name.trim()) {
            newErrors.name = "Name is required.";
            valid = false;
        }

        // Company Name Validation
        if (!formData.companyName.trim()) {
            newErrors.companyName = "Company Name is required.";
            valid = false;
        }

        // Email Regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            newErrors.email = "Please enter a valid email address.";
            valid = false;
        }

        // Phone Validation (Based on Country Code)
        const country = countryOptions.find(c => c.code === formData.countryCode) || countryOptions[0];
        const cleanPhone = formData.phone.replace(/\D/g, '');

        if (!cleanPhone || cleanPhone.length < country.min || cleanPhone.length > country.max) {
            newErrors.phone = `Invalid length for ${country.label}. Expected ${country.min}-${country.max} digits.`;
            valid = false;
        }

        setFieldErrors(newErrors);
        return valid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg(null);

        // Run Client-side Validation (Custom)
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // STEP 1: Pre-check for duplicates (BEFORE image upload)
            await callGoogleScript({ checkOnly: true });

            // STEP 2: Upload to ImgBB
            let imageUrl = "No file uploaded";
            if (file) {
                const formData = new FormData();
                formData.append('image', file);

                // Replace with your ImgBB API Key
                const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;
                // Note: This is a public free key for demo. User should ideally use their own.

                const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                    method: 'POST',
                    body: formData
                });

                const imgbbResult = await imgbbResponse.json();

                if (imgbbResult.success) {
                    imageUrl = imgbbResult.data.url;
                    console.log("Image uploaded to ImgBB:", imageUrl);
                } else {
                    throw new Error("ImgBB Upload Failed: " + (imgbbResult.error?.message || "Unknown error"));
                }
            }

            // STEP 3: Final Save
            await callGoogleScript({ imageUrl: imageUrl });

            setStep('success');
        } catch (error) {
            console.error("Error submitting form", error);
            setErrorMsg(error.message); // Trigger Error UI
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetModal = () => {
        setStep('upload');
        setFile(null);
        setPreviewUrl(null);
        setFormData({ name: '', companyName: '', email: '', phone: '' });
        setErrorMsg(null);
        setFieldErrors({ email: null, phone: null });
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Error Modal / Alert Replacement */}
                        {errorMsg ? (
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-dark-card border border-red-500/30 w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center"
                            >
                                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                                    <X size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Submission Failed</h3>
                                <p className="text-gray-300 mb-6">{errorMsg}</p>
                                <button
                                    onClick={resetModal}
                                    className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium"
                                >
                                    OK
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-dark-card border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden"
                            >
                                {/* Close Button */}
                                <button
                                    onClick={resetModal}
                                    className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 transition-colors"
                                >
                                    <X size={20} />
                                </button>

                                <div className="p-6 md:p-8">
                                    <AnimatePresence mode="wait">

                                        {/* STEP 1: UPLOAD */}
                                        {step === 'upload' && (
                                            <motion.div
                                                key="upload"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="text-center"
                                            >
                                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                                                    <Upload size={32} />
                                                </div>
                                                <h2 className="text-2xl font-heading font-bold text-white mb-2">Upload Your Product</h2>
                                                <p className="text-gray-400 text-sm mb-8">Upload a clear photo of your product to get a free AI sample.</p>

                                                <div
                                                    className="border-2 border-dashed border-white/10 rounded-xl p-8 mb-8 hover:border-primary/50 transition-colors cursor-pointer bg-white/5"
                                                    onDragOver={(e) => e.preventDefault()}
                                                    onDrop={handleDrop}
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    {previewUrl ? (
                                                        <div className="relative w-full h-48 rounded-lg overflow-hidden">
                                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                                <p className="text-white text-sm">Click to change</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-3 py-4">
                                                            <ImageIcon className="w-10 h-10 text-gray-500" />
                                                            <p className="text-gray-400 text-sm">Click or drag image here</p>
                                                            <span className="text-xs text-gray-600">JPG, PNG up to 5MB</span>
                                                        </div>
                                                    )}
                                                    <input
                                                        type="file"
                                                        ref={fileInputRef}
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={handleFileChange}
                                                    />
                                                </div>

                                                <button
                                                    onClick={() => setStep('form')}
                                                    disabled={!file}
                                                    className="w-full py-3 bg-primary text-black font-bold rounded-lg hover:bg-primary-light transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                >
                                                    Next Step <ArrowRight size={18} />
                                                </button>
                                            </motion.div>
                                        )}

                                        {/* STEP 2: FORM */}
                                        {step === 'form' && (
                                            <motion.div
                                                key="form"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                            >
                                                <h2 className="text-2xl font-heading font-bold text-white mb-6">Where should we send it?</h2>

                                                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                                                    <div>
                                                        <label className="text-sm text-gray-400 block mb-1">Your Name</label>
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            value={formData.name}
                                                            onChange={handleInputChange}
                                                            className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-white focus:outline-none ${fieldErrors.name ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-primary/50'}`}
                                                            placeholder="John Doe"
                                                            required
                                                        />
                                                        {fieldErrors.name && <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.name}</p>}
                                                    </div>
                                                    <div>
                                                        <label className="text-sm text-gray-400 block mb-1">Company Name</label>
                                                        <input
                                                            type="text"
                                                            name="companyName"
                                                            value={formData.companyName}
                                                            onChange={handleInputChange}
                                                            className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-white focus:outline-none ${fieldErrors.companyName ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-primary/50'}`}
                                                            placeholder="Acme Inc."
                                                            required
                                                        />
                                                        {fieldErrors.companyName && <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.companyName}</p>}
                                                    </div>
                                                    <div className="relative">
                                                        <label className="text-sm text-gray-400 block mb-1">Email Address</label>
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            value={formData.email}
                                                            onChange={handleInputChange}
                                                            className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-white focus:outline-none ${fieldErrors.email ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-primary/50'}`}
                                                            placeholder="john@acme.com"
                                                            required
                                                        />
                                                        {fieldErrors.email && <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.email}</p>}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-gray-300">Phone Number</label>
                                                        <div className="flex gap-2">
                                                            <div className="relative">
                                                                <select
                                                                    name="countryCode"
                                                                    value={formData.countryCode}
                                                                    onChange={handleInputChange}
                                                                    className="bg-white/5 border border-white/10 rounded-lg pl-3 pr-8 py-3 text-white focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-sm w-[120px] appearance-none cursor-pointer truncate"
                                                                >
                                                                    {countryOptions.map(c => (
                                                                        <option key={c.code} value={c.code} className="bg-dark-bg">{c.label}</option>
                                                                    ))}
                                                                </select>
                                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
                                                                    ▼
                                                                </div>
                                                            </div>
                                                            <input
                                                                type="tel"
                                                                name="phone"
                                                                value={formData.phone}
                                                                onChange={(e) => {
                                                                    const val = e.target.value.replace(/[^0-9\s-]/g, '');
                                                                    handleInputChange({ target: { name: 'phone', value: val } });
                                                                }}
                                                                className={`flex-1 bg-white/5 border ${fieldErrors.phone ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-primary/50'} rounded-lg px-4 py-3 text-white focus:outline-none focus:bg-white/10 transition-all placeholder:text-gray-600 min-w-0`}
                                                                placeholder="1234567890"
                                                                required
                                                            />
                                                        </div>
                                                        {fieldErrors.phone && <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.phone}</p>}
                                                    </div>

                                                    <div>
                                                        <label className="text-sm text-gray-400 block mb-1">Style Preferences / Instructions <span className="text-gray-500 text-xs">(Optional)</span></label>
                                                        <textarea
                                                            name="styleInstructions"
                                                            value={formData.styleInstructions}
                                                            onChange={handleInputChange}
                                                            rows="3"
                                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary/50 focus:outline-none resize-none placeholder:text-gray-600"
                                                            placeholder="Tell us about the vibe, colors, or specific style you're looking for..."
                                                        />
                                                    </div>

                                                    <button
                                                        type="submit"
                                                        disabled={isSubmitting}
                                                        className="w-full py-4 bg-primary text-black font-bold text-lg rounded-lg hover:bg-primary-light transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] mt-4 disabled:opacity-70 flex items-center justify-center gap-2"
                                                    >
                                                        {isSubmitting ? (
                                                            <>
                                                                <Loader2 className="animate-spin" size={24} />
                                                                Processing...
                                                            </>
                                                        ) : (
                                                            'Get Free Sample'
                                                        )}
                                                    </button>
                                                </form>
                                            </motion.div>
                                        )}

                                        {/* STEP 3: SUCCESS */}
                                        {step === 'success' && (
                                            <motion.div
                                                key="success"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="text-center py-8"
                                            >
                                                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                                                    <CheckCircle size={40} />
                                                </div>
                                                <h2 className="text-3xl font-heading font-bold text-white mb-4">Request Received!</h2>
                                                <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                                                    We will send your processed image within <br />
                                                    <span className="text-primary font-bold">48 hours</span> to your email.
                                                </p>
                                                <button
                                                    onClick={resetModal}
                                                    className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium border border-white/10"
                                                >
                                                    Back to Home
                                                </button>
                                            </motion.div>
                                        )}

                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default FreeSampleModal;
