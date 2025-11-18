export const CLINIC_TYPES = {
    DENTAL: "Dental Clinic",
    PSYCHIATRY: "Psychiatry Clinic",
    DERMATOLOGY: "Dermatology Clinic",
    OPTOMETRY: "Optometry Clinic",
}

const COMMON_FIELDS = {
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    appointmentDate: null,
    preferredTime: null,
    appointmentID: "",
    clinic_name: "",
    admin_id: "",
    type: "",
    clinicType: ""
}

const CLINIC_SPECIFIC_FIELDS = {
    [CLINIC_TYPES.DENTAL]: {
        // medical history state
        allergiesDetails: "",
        takingPrescriptionMedicationDetails: "",
        chronicConditionDetails: "",
        surgeriesDetails: "",
        jawPainDetails: "",
        experiencedExcessiveBleedingDetails: "",
        heartProblemsDetails: "",
        advisedTakingAntibioticsDetails: "",
        // lifestyle information state
        smokeDetails: "",
        consumeSugaryFoodsOrDrinksDetails: "",
        dentalFlossDetails: "",
        consumeAlcoholDetails: "",
        participateInSportsDetails: "",
        balancedDietDetails: "",
        regularExerciseDetails: "",
        eatingDisordersDetails: "",
        // clinic assessment state
        experienceBleedingDetails: "",
        toothSensitivityDetails: "",
        dentalAppearanceDetails: "",
        looseTeethDetails: "",
        badBreathOrBadTasteDetails: "",
        dentalXraysDetails: "",
        dentalRestorationDetails: "",
        orthodonticTreatmentDetails: "",
        // oral hygiene state
        brushFrequencyDetails: "",
        useMouthWashDetails: "",
        replaceToothbrushDetails: "",
        cleanTongueDetails: "",
        regularCheckupDetails: "",
        dentalAnxietyDetails: "",
        dentalTraumaDetails: "",
        // consent and agreement state
        consent: ""
    },
    [CLINIC_TYPES.PSYCHIATRY] : {
        // mental health history
        diagnosedMentalHealthConditionDetails: "",
        takingPsychiatricMedicationDetails: "",
        hospitalizedForMentalHealthReasonDetails: "",
        familyHistoryOfMentalHealthConditionsDetails: "",
        suicidalThoughtsOrBehaviorsDetails: "",
        selfHarmOrSuicideDetails: "",
        counselingOrTherapyDetails: "",
        emotionalOrBehavioralPatternsDetails: "",
        // current symptoms state
        moodDetails: "",
        excessiveWorryOrAnxietyDetails: "",
        sleepPatternsDetails: "",
        appetiteOrWeightDetails: "",
        sleepChangesDetails: "",
        hopelessnessOrWorthlessnessDetails: "",
        agitationOrImpulsivityDetails: "",
        difficultyConcentratingDetails: "",
        // lifestyle factors state
        stressLevelsDetails: "",
        supportSystemDetails: "",
        majorLifeChangesDetails: "",
        substancesDetails: "",
        sleepHoursDetails: "",
        socialGroupsDetails: "",
        livingSituationDetails: "",
        copingWithStressDetails: "",
        // treatment history state
        mentalHealthTreatmentDetails: "",
        treatmentHistoryDetails: "",
        currentlyInTherapyDetails: "",
        negativeExperienceWithMentalHealthTreatmentDetails: "",
        currentlyUnderCareOfPsychiatristDetails: "",
        stoppedTakingPsychiatricMedicationsDetails: "",
        sideEffectsFromPsychiatricMedicationsDetails: "",
        consistentWithAttendingTherapyOrTakingMedicationsDetails: "",
        consent: ""
    }
}

export const getInitialFormState = (clinicType) => ({
    ...COMMON_FIELDS,
    ...(CLINIC_SPECIFIC_FIELDS[clinicType])
})

export const getInitialFieldErrors = (clinicType) => {
    const initialState = getInitialFormState(clinicType);
    return Object.keys(initialState).reduce((acc, key) => {
        acc[key] = "";
        return acc;
    }, {});
}