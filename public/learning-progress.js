// Generated from lib/learning-progress.ts; edit the shared TypeScript source.
"use strict";
var DevPathLearningProgress = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // lib/learning-progress.ts
  var learning_progress_exports = {};
  __export(learning_progress_exports, {
    mergeExerciseLearning: () => mergeExerciseLearning,
    mergeExerciseLearningWithReport: () => mergeExerciseLearningWithReport,
    mergeLearningRecords: () => mergeLearningRecords,
    mergeProgressSnapshots: () => mergeProgressSnapshots,
    mergeProgressSnapshotsWithReport: () => mergeProgressSnapshotsWithReport,
    migrateLegacyLearning: () => migrateLegacyLearning,
    sanitizeLearningRecord: () => sanitizeLearningRecord,
    transitionLearning: () => transitionLearning
  });

  // lib/progress-contract.json
  var limits = {
    codeChars: 12e3,
    stage02PredictionChars: 2e3,
    draftChars: 12e3,
    predictionChars: 400,
    reflectionChars: 600,
    stage01ReflectionChars: 1200,
    outputChars: 9e3,
    attemptCount: 1e5,
    requestBytes: 9e5,
    stage02Blocks: 3,
    hintLevel: 3,
    parsonsLetters: 5,
    rubricItems: 20,
    contentVersion: 1e3,
    reviewIntervalIndex: 3,
    activeDays: 30,
    predictionRows: 12,
    transferCount: 2,
    transferIdChars: 30,
    secondOrderChars: 80,
    learningEvents: 12,
    learningAttemptHistory: 1e3,
    learningEvidenceHistory: 388,
    learningRecords: 388,
    learningIdChars: 96,
    learningFingerprintChars: 128,
    learningPayloadChars: 2e5,
    reviewAttempts: 388,
    reviewHistory: 10,
    reviewPayloadChars: 15e4
  };

  // lib/progress-evidence.ts
  var attemptSize = ([key, attempt]) => JSON.stringify([key, attempt]).length;
  function boundReviewAttempts(candidates) {
    const priority = [...candidates].sort((a, b) => {
      const pendingA = a[1].status === "pending" ? 0 : 1, pendingB = b[1].status === "pending" ? 0 : 1;
      if (pendingA !== pendingB) return pendingA - pendingB;
      return Math.max(b[1].finishedAt, b[1].startedAt) - Math.max(a[1].finishedAt, a[1].startedAt) || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);
    });
    const kept = /* @__PURE__ */ new Set();
    let chars = 0;
    for (const entry of priority) {
      const size = attemptSize(entry);
      if (kept.size >= limits.reviewAttempts || chars + size > limits.reviewPayloadChars) continue;
      kept.add(entry[0]);
      chars += size;
    }
    const attempts = {};
    for (const [key, attempt] of candidates) if (kept.has(key)) attempts[key] = attempt;
    return { attempts, dropped: candidates.length - kept.size };
  }

  // lib/learning-progress.ts
  var maxEvents = limits.learningEvents;
  var maxAttempts = limits.learningAttemptHistory;
  var maxEvidence = limits.learningEvidenceHistory;
  var maxRecords = limits.learningRecords;
  var idLimit = limits.learningIdChars;
  var fingerprintLimit = limits.learningFingerprintChars;
  var sourceValues = /* @__PURE__ */ new Set(["browser", "local-declared", "rubric-declared"]);
  var kinds = /* @__PURE__ */ new Set(["attempted", "studied", "verified", "demonstrated", "transfer-declared", "help"]);
  var states = /* @__PURE__ */ new Set(["attempted", "studied", "verified", "demonstrated", "transfer-declared"]);
  function object(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value) ? value : {};
  }
  function validTimestamp2(value) {
    return typeof value === "string" && value.length <= 40 && Number.isFinite(Date.parse(value));
  }
  function validId(value) {
    return typeof value === "string" && value.length > 0 && value.length <= idLimit && !value.includes("\0");
  }
  function validFingerprint(value) {
    return typeof value === "string" && value.length > 0 && value.length <= fingerprintLimit && !value.includes("\0");
  }
  function version(value) {
    return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= limits.contentVersion ? value : null;
  }
  function latest(a, b) {
    return Date.parse(a) >= Date.parse(b) ? a : b;
  }
  function sanitizeEvidence(value) {
    const item = object(value);
    const contentVersion = version(item.contentVersion);
    const assessmentVersion = version(item.assessmentVersion);
    if (!validId(item.attemptId) || contentVersion === null || assessmentVersion === null || !validFingerprint(item.fingerprint) || item.fingerprint.startsWith("unknown") || !sourceValues.has(item.source) || !validTimestamp2(item.at)) return void 0;
    return {
      attemptId: item.attemptId,
      contentVersion,
      assessmentVersion,
      fingerprint: item.fingerprint,
      source: item.source,
      at: item.at,
      ...validId(item.eventId) ? { eventId: item.eventId } : {}
    };
  }
  function sanitizeEvent(value) {
    const item = object(value);
    if (!validId(item.id) || !kinds.has(item.kind) || !validId(item.attemptId) || !validTimestamp2(item.at) || !validFingerprint(item.fingerprint) || !sourceValues.has(item.source)) return void 0;
    return {
      id: item.id,
      kind: item.kind,
      attemptId: item.attemptId,
      at: item.at,
      fingerprint: item.fingerprint,
      ...typeof item.assisted === "boolean" ? { assisted: item.assisted } : {},
      source: item.source
    };
  }
  function compactEvents(values) {
    const byId = /* @__PURE__ */ new Map();
    for (const raw of values) {
      const item = sanitizeEvent(raw);
      if (!item) continue;
      const previous = byId.get(item.id);
      if (!previous || Date.parse(item.at) >= Date.parse(previous.at)) byId.set(item.id, item);
    }
    return [...byId.values()].sort((a, b) => Date.parse(a.at) - Date.parse(b.at) || a.id.localeCompare(b.id)).slice(-maxEvents);
  }
  function compactEvidence(values) {
    const byId = /* @__PURE__ */ new Map();
    for (const raw of values) {
      const item = sanitizeEvidence(raw);
      if (!item) continue;
      const key = item.eventId || `${item.attemptId}|${item.contentVersion}|${item.assessmentVersion}|${item.fingerprint}|${item.source}|${item.at}`;
      const previous = byId.get(key);
      if (!previous || Date.parse(item.at) >= Date.parse(previous.at)) byId.set(key, item);
    }
    return [...byId.values()].sort((a, b) => Date.parse(a.at) - Date.parse(b.at)).slice(-maxEvidence);
  }
  function compactAttempts(values, currentAttemptId, currentStartedAt) {
    const byId = /* @__PURE__ */ new Map();
    for (const raw of values) {
      const item = object(raw);
      if (!validId(item.attemptId) || !validTimestamp2(item.startedAt)) continue;
      const entry = { attemptId: item.attemptId, startedAt: item.startedAt };
      const previous = byId.get(entry.attemptId);
      if (!previous || Date.parse(entry.startedAt) < Date.parse(previous.startedAt)) byId.set(entry.attemptId, entry);
    }
    if (validId(currentAttemptId) && validTimestamp2(currentStartedAt) && !byId.has(currentAttemptId)) {
      byId.set(currentAttemptId, { attemptId: currentAttemptId, startedAt: currentStartedAt });
    }
    let entries = [...byId.values()].sort((a, b) => Date.parse(a.startedAt) - Date.parse(b.startedAt));
    if (entries.length > maxAttempts) {
      entries = entries.slice(-maxAttempts);
      if (currentAttemptId && !entries.some((entry) => entry.attemptId === currentAttemptId)) {
        entries[0] = { attemptId: currentAttemptId, startedAt: currentStartedAt || entries[0].startedAt };
        entries.sort((a, b) => Date.parse(a.startedAt) - Date.parse(b.startedAt));
      }
    }
    return entries;
  }
  function evidenceHistory(record2) {
    if (!record2) return [];
    return compactEvidence([
      ...Array.isArray(record2.evidenceHistory) ? record2.evidenceHistory : [],
      record2.verifiedEvidence,
      record2.demonstratedEvidence,
      record2.transferEvidence
    ]);
  }
  function sanitizeLearningRecord(value) {
    const item = object(value);
    const contentVersion = version(item.contentVersion);
    const assessmentVersion = version(item.assessmentVersion);
    const mode = item.mode;
    const state = item.state;
    if (item.schemaVersion !== 1 || contentVersion === null || assessmentVersion === null || mode !== "learn" && mode !== "recall" || !states.has(state) || typeof item.assisted !== "boolean" || !validId(item.attemptId) || typeof item.attemptIndependent !== "boolean" || !validFingerprint(item.currentFingerprint) || !validTimestamp2(item.currentUpdatedAt)) return null;
    let serializedLength;
    try {
      serializedLength = JSON.stringify(value).length;
    } catch {
      return null;
    }
    if (serializedLength > limits.learningPayloadChars) return null;
    const allValidEvents = (Array.isArray(item.events) ? item.events : []).map(sanitizeEvent).filter((event) => Boolean(event));
    const events = compactEvents(allValidEvents);
    const attemptHistory = compactAttempts([
      ...Array.isArray(item.attemptHistory) ? item.attemptHistory : [],
      ...allValidEvents.filter((event) => event.kind === "attempted").map((event) => ({ attemptId: event.attemptId, startedAt: event.at }))
    ], item.attemptId, item.currentUpdatedAt);
    let verifiedEvidence = sanitizeEvidence(item.verifiedEvidence);
    let demonstratedEvidence = sanitizeEvidence(item.demonstratedEvidence);
    let transferEvidence = sanitizeEvidence(item.transferEvidence);
    const evidenceHistoryValues = compactEvidence([
      ...Array.isArray(item.evidenceHistory) ? item.evidenceHistory : [],
      verifiedEvidence,
      demonstratedEvidence,
      transferEvidence
    ]);
    const matchesCurrent = (evidence) => Boolean(evidence && evidence.attemptId === item.attemptId && evidence.contentVersion === contentVersion && evidence.assessmentVersion === assessmentVersion && evidence.fingerprint === item.currentFingerprint);
    const assisted = item.assisted || allValidEvents.some((event) => event.attemptId === item.attemptId && event.kind === "help");
    const currentUpdatedAt = allValidEvents.reduce((latestAt, event) => event.attemptId === item.attemptId && Date.parse(event.at) > Date.parse(latestAt) ? event.at : latestAt, item.currentUpdatedAt);
    let sanitizedState = state;
    if (sanitizedState === "demonstrated" && demonstratedEvidence?.source !== "browser") {
      transferEvidence = transferEvidence ?? demonstratedEvidence;
      demonstratedEvidence = void 0;
      sanitizedState = "transfer-declared";
    }
    if (sanitizedState === "demonstrated" && assisted) sanitizedState = "verified";
    if (sanitizedState === "demonstrated" && !item.attemptIndependent) sanitizedState = "verified";
    if (sanitizedState === "transfer-declared" && (assisted || !item.attemptIndependent || !matchesCurrent(transferEvidence))) {
      sanitizedState = "attempted";
      transferEvidence = void 0;
    }
    if (sanitizedState === "verified" && !matchesCurrent(verifiedEvidence)) {
      if (matchesCurrent(demonstratedEvidence)) verifiedEvidence = demonstratedEvidence;
      else return null;
    }
    return {
      schemaVersion: 1,
      contentVersion,
      assessmentVersion,
      mode,
      state: sanitizedState,
      assisted,
      attemptId: item.attemptId,
      attemptIndependent: item.attemptIndependent,
      currentFingerprint: item.currentFingerprint,
      currentUpdatedAt,
      attemptHistory,
      ...verifiedEvidence ? { verifiedEvidence } : {},
      ...demonstratedEvidence ? { demonstratedEvidence } : {},
      ...transferEvidence ? { transferEvidence } : {},
      evidenceHistory: evidenceHistoryValues,
      events
    };
  }
  function validContext(context, event) {
    return version(context.contentVersion) !== null && version(context.assessmentVersion) !== null && validFingerprint(context.fingerprint) && context.fingerprint === event.fingerprint && typeof context.independent === "boolean" && typeof context.assessmentPassed === "boolean";
  }
  function appendEvent(record2, event) {
    return { ...record2, events: compactEvents([...record2.events, event]) };
  }
  function newRecord(event, context, previous) {
    const mode = context.mode === "recall" ? "recall" : "learn";
    const assisted = mode === "learn" || !context.independent || event.kind === "help" || event.assisted === true || Boolean(previous?.assisted && !context.independent);
    return {
      schemaVersion: 1,
      contentVersion: version(context.contentVersion) ?? 0,
      assessmentVersion: version(context.assessmentVersion) ?? 0,
      mode,
      state: "attempted",
      assisted,
      attemptId: event.attemptId,
      attemptIndependent: context.independent,
      currentFingerprint: event.fingerprint,
      currentUpdatedAt: event.at,
      attemptHistory: compactAttempts([...previous?.attemptHistory || [], { attemptId: event.attemptId, startedAt: event.at }], event.attemptId, event.at),
      ...previous?.verifiedEvidence ? { verifiedEvidence: previous.verifiedEvidence } : {},
      ...previous?.demonstratedEvidence ? { demonstratedEvidence: previous.demonstratedEvidence } : {},
      ...previous?.transferEvidence ? { transferEvidence: previous.transferEvidence } : {},
      evidenceHistory: evidenceHistory(previous),
      events: compactEvents([...previous?.events || [], event])
    };
  }
  function transitionLearning(current, rawEvent, context) {
    const event = sanitizeEvent(rawEvent);
    if (!event || !validContext(context, event)) {
      const safeCurrent = sanitizeLearningRecord(current);
      if (safeCurrent) return safeCurrent;
      throw new TypeError("A learning event requires a valid attempt identity, timestamp, source, and fingerprint.");
    }
    const record2 = sanitizeLearningRecord(current);
    const sameAttempt = record2?.attemptId === event.attemptId;
    const duplicate = record2?.events.some((item) => item.id === event.id);
    if (duplicate && sameAttempt) return record2;
    if (!record2) {
      if (event.kind !== "attempted" && event.kind !== "studied") {
        throw new TypeError("A learning record must begin with an explicit attempt or study event.");
      }
      const fresh = newRecord(event, context, record2);
      if (event.kind === "studied") fresh.state = "studied";
      return fresh;
    }
    if (Date.parse(event.at) < Date.parse(record2.currentUpdatedAt)) return record2;
    if (!sameAttempt) {
      const previouslyUsed = record2.attemptHistory.some((item) => item.attemptId === event.attemptId);
      if (event.kind !== "attempted" || !context.independent || previouslyUsed) return record2;
      return newRecord(event, context, record2);
    }
    const mode = context.mode === "recall" ? "recall" : context.mode === "learn" ? "learn" : record2.mode;
    const changedFingerprint = event.fingerprint !== record2.currentFingerprint;
    const changedVersion = context.contentVersion !== record2.contentVersion || context.assessmentVersion !== record2.assessmentVersion;
    let next = {
      ...record2,
      contentVersion: version(context.contentVersion) ?? record2.contentVersion,
      assessmentVersion: version(context.assessmentVersion) ?? record2.assessmentVersion,
      mode,
      currentFingerprint: event.fingerprint,
      currentUpdatedAt: latest(record2.currentUpdatedAt, event.at),
      assisted: record2.assisted || event.assisted === true || event.kind === "help" || mode === "learn",
      state: changedFingerprint || changedVersion ? "attempted" : record2.state
    };
    next = appendEvent(next, event);
    if ((next.assisted || !next.attemptIndependent) && next.state === "demonstrated") {
      next.state = "verified";
      if (!next.verifiedEvidence || next.verifiedEvidence.attemptId !== next.attemptId || next.verifiedEvidence.fingerprint !== next.currentFingerprint) {
        if (next.demonstratedEvidence?.attemptId === next.attemptId && next.demonstratedEvidence.fingerprint === next.currentFingerprint) {
          next.verifiedEvidence = next.demonstratedEvidence;
        } else next.state = "attempted";
      }
    }
    if ((next.assisted || !next.attemptIndependent) && next.state === "transfer-declared") next.state = "attempted";
    if (event.kind === "attempted") {
      next.state = "attempted";
      next.attemptIndependent = record2.attemptIndependent && context.independent;
      return next;
    }
    if (event.kind === "help") return next;
    if (event.kind === "studied") {
      if (next.state === "attempted") next.state = "studied";
      return next;
    }
    const versionsMatch = context.contentVersion > 0 && context.assessmentVersion > 0 && context.contentVersion === record2.contentVersion && context.assessmentVersion === record2.assessmentVersion;
    const fingerprintMatches = event.fingerprint === record2.currentFingerprint && !event.fingerprint.startsWith("unknown");
    const evidence = {
      attemptId: event.attemptId,
      contentVersion: context.contentVersion,
      assessmentVersion: context.assessmentVersion,
      fingerprint: event.fingerprint,
      source: event.source,
      at: event.at,
      eventId: event.id
    };
    if (event.kind === "transfer-declared") {
      if (context.independent && record2.attemptIndependent && !next.assisted && versionsMatch && fingerprintMatches && event.attemptId === record2.attemptId && event.source !== "browser") {
        next.state = "transfer-declared";
        next.transferEvidence = evidence;
        next.evidenceHistory = compactEvidence([...next.evidenceHistory, evidence]);
      }
      return next;
    }
    const promotable = context.assessmentPassed && versionsMatch && fingerprintMatches && event.attemptId === record2.attemptId && sourceValues.has(event.source);
    if (!promotable) return next;
    if (event.kind === "verified") {
      next.state = "verified";
      next.verifiedEvidence = evidence;
      next.evidenceHistory = compactEvidence([...next.evidenceHistory, evidence]);
    } else if (event.kind === "demonstrated" && event.source === "browser" && context.independent && record2.attemptIndependent && !next.assisted) {
      next.state = "demonstrated";
      next.verifiedEvidence = evidence;
      next.demonstratedEvidence = evidence;
      next.evidenceHistory = compactEvidence([...next.evidenceHistory, evidence]);
    }
    return next;
  }
  function preferredRecord(left, right) {
    return Date.parse(left.currentUpdatedAt) >= Date.parse(right.currentUpdatedAt) ? left : right;
  }
  function preferEvidence(a, b) {
    if (!a) return b;
    if (!b) return a;
    return Date.parse(a.at) >= Date.parse(b.at) ? a : b;
  }
  function mergeLearningRecords(leftValue, rightValue) {
    const left = sanitizeLearningRecord(leftValue);
    const right = sanitizeLearningRecord(rightValue);
    if (!left) return right;
    if (!right) return left;
    const selected = preferredRecord(left, right);
    const sameAttempt = left.attemptId === right.attemptId;
    const events = compactEvents([...left.events, ...right.events]);
    const assisted = sameAttempt ? left.assisted || right.assisted || events.some((event) => event.attemptId === selected.attemptId && event.kind === "help") : selected.assisted;
    let state = selected.state;
    const attemptIndependent = sameAttempt ? left.attemptIndependent && right.attemptIndependent : selected.attemptIndependent;
    if ((assisted || !attemptIndependent) && state === "demonstrated") {
      state = "verified";
      const verified = selected.verifiedEvidence || selected.demonstratedEvidence;
      if (!verified || verified.attemptId !== selected.attemptId || verified.fingerprint !== selected.currentFingerprint) state = "attempted";
    }
    if ((assisted || !attemptIndependent) && state === "transfer-declared") state = "attempted";
    return {
      ...selected,
      ...sameAttempt ? { assisted, attemptIndependent } : {},
      state,
      attemptHistory: compactAttempts([...left.attemptHistory, ...right.attemptHistory], selected.attemptId, selected.currentUpdatedAt),
      verifiedEvidence: preferEvidence(left.verifiedEvidence, right.verifiedEvidence),
      demonstratedEvidence: preferEvidence(left.demonstratedEvidence, right.demonstratedEvidence),
      transferEvidence: preferEvidence(left.transferEvidence, right.transferEvidence),
      evidenceHistory: compactEvidence([...evidenceHistory(left), ...evidenceHistory(right)]),
      events
    };
  }
  function mergeExerciseLearningWithReport(leftValue, rightValue) {
    const left = object(leftValue);
    const right = object(rightValue);
    const candidates = [];
    for (const id of /* @__PURE__ */ new Set([...Object.keys(left), ...Object.keys(right)])) {
      if (id === "__proto__" || id === "constructor" || id === "prototype") continue;
      const record2 = mergeLearningRecords(left[id], right[id]);
      if (record2) candidates.push([id, record2]);
    }
    const kept = new Set(
      [...candidates].sort((a, b) => Date.parse(b[1].currentUpdatedAt) - Date.parse(a[1].currentUpdatedAt) || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)).slice(0, maxRecords).map(([id]) => id)
    );
    const records = {};
    for (const [id, record2] of candidates) {
      if (kept.has(id)) records[id] = record2;
    }
    const droppedLearningRecords = candidates.length - kept.size;
    return { records, droppedLearningRecords, truncated: droppedLearningRecords > 0 };
  }
  function mergeExerciseLearning(leftValue, rightValue) {
    return mergeExerciseLearningWithReport(leftValue, rightValue).records;
  }
  var mapFields = [
    "answers",
    "attempts",
    "challenges",
    "exerciseVersions",
    "exerciseDrafts",
    "exercisePredictions",
    "exerciseReflections",
    "exerciseEvidence",
    "warmupCompleted",
    "reviewSchedule",
    "stage01",
    "stage02"
  ];
  function mergeProgressSnapshots(localValue, remoteValue) {
    return mergeProgressSnapshotsWithReport(localValue, remoteValue).progress;
  }
  function mergeReviewSchedules(localValue, remoteValue) {
    const local = object(localValue), remote = object(remoteValue);
    const merged = { ...remote };
    for (const [id, value] of Object.entries(local)) {
      const other = object(remote[id]);
      const localAt = typeof object(value).lastReviewedAt === "string" ? object(value).lastReviewedAt : "";
      const remoteAt = typeof other.lastReviewedAt === "string" ? other.lastReviewedAt : "";
      if (!(remoteAt > localAt && remote[id] !== void 0)) merged[id] = value;
    }
    return merged;
  }
  function mergeReviewAttempts(localValue, remoteValue) {
    const local = object(localValue), remote = object(remoteValue);
    const activity = (value) => {
      const item = object(value);
      return Math.max(Number(item.finishedAt) || 0, Number(item.startedAt) || 0);
    };
    const candidates = [];
    for (const id of /* @__PURE__ */ new Set([...Object.keys(remote), ...Object.keys(local)])) {
      if (id === "__proto__" || id === "constructor" || id === "prototype") continue;
      const localHas = Object.hasOwn(local, id), remoteHas = Object.hasOwn(remote, id);
      const chosen = localHas && remoteHas ? activity(remote[id]) > activity(local[id]) ? remote[id] : local[id] : localHas ? local[id] : remote[id];
      candidates.push([id, chosen]);
    }
    return boundReviewAttempts(candidates);
  }
  function mergeProgressSnapshotsWithReport(localValue, remoteValue) {
    const local = object(localValue);
    const remote = object(remoteValue);
    const output = { ...remote, ...local };
    for (const field of mapFields) output[field] = { ...object(remote[field]), ...object(local[field]) };
    output.completed = [.../* @__PURE__ */ new Set([
      ...Array.isArray(remote.completed) ? remote.completed : [],
      ...Array.isArray(local.completed) ? local.completed : []
    ])];
    output.activeDays = [.../* @__PURE__ */ new Set([
      ...Array.isArray(remote.activeDays) ? remote.activeDays : [],
      ...Array.isArray(local.activeDays) ? local.activeDays : []
    ])];
    const learning = mergeExerciseLearningWithReport(local.exerciseLearning, remote.exerciseLearning);
    output.exerciseLearning = learning.records;
    output.reviewSchedule = mergeReviewSchedules(local.reviewSchedule, remote.reviewSchedule);
    const review = mergeReviewAttempts(local.reviewAttempts, remote.reviewAttempts);
    output.reviewAttempts = review.attempts;
    return {
      progress: output,
      droppedLearningRecords: learning.droppedLearningRecords,
      droppedReviewAttempts: review.dropped,
      truncated: learning.truncated || review.dropped > 0
    };
  }
  function assessmentMap(value) {
    const data = object(value);
    const raw = object(data.assessment ?? data);
    if (Array.isArray(value)) {
      const result = {};
      for (const entry of value) {
        const item = object(entry);
        const assessment = object(item.assessment ?? item);
        if (typeof item.id === "string") result[item.id] = assessment;
      }
      return result;
    }
    return raw;
  }
  function migrateLegacyLearning(progressValue, catalogValue, assessmentsValue) {
    const progress = object(progressValue);
    const clone = JSON.parse(JSON.stringify(progress));
    const existing = object(progress.exerciseLearning);
    const learning = {};
    for (const [id, value] of Object.entries(existing)) {
      const record2 = sanitizeLearningRecord(value);
      if (record2) learning[id] = record2;
    }
    const catalog = Array.isArray(catalogValue) ? catalogValue : [];
    const assessments = assessmentMap(assessmentsValue);
    const completed = new Set(Array.isArray(progress.completed) ? progress.completed.filter((id) => typeof id === "string") : []);
    const answers = object(progress.answers);
    const attempts = object(progress.attempts);
    const evidenceMap = object(progress.exerciseEvidence);
    const drafts = object(progress.exerciseDrafts);
    const predictions = object(progress.exercisePredictions);
    const reflections = object(progress.exerciseReflections);
    const warmups = object(progress.warmupCompleted);
    const stage01 = object(progress.stage01);
    const stage02 = object(progress.stage02);
    for (const raw of catalog) {
      const item = object(raw);
      const id = typeof item.id === "string" ? item.id : "";
      if (!id || learning[id]) continue;
      const key = [id, `${id}@v${item.contentVersion}`];
      const oldEvidence = key.map((candidate) => object(evidenceMap[candidate])).find((value) => Object.keys(value).length > 0);
      const signal = completed.has(id) || answers[id] === true || key.some((candidate) => typeof attempts[candidate] === "number" && attempts[candidate] > 0 || typeof drafts[candidate] === "string" && drafts[candidate].length > 0 || typeof predictions[candidate] === "string" && predictions[candidate].length > 0 || typeof reflections[candidate] === "string" && reflections[candidate].length > 0 || warmups[candidate] === true || Object.keys(object(stage01[candidate])).length > 0 || Object.keys(object(stage02[candidate])).length > 0) || Object.keys(oldEvidence || {}).length > 0;
      if (!signal) continue;
      const catalogVersion = version(item.contentVersion) ?? 0;
      const rawAssessment = object(assessments[id]);
      const assessmentVersion = version(rawAssessment.version) ?? 0;
      const linked = Boolean(oldEvidence && oldEvidence.testsPassed === true && oldEvidence.runResult === "result" && validFingerprint(oldEvidence.fingerprint) && !oldEvidence.fingerprint.startsWith("unknown") && oldEvidence.contentVersion === catalogVersion && oldEvidence.assessmentVersion === assessmentVersion && sourceValues.has(oldEvidence.source) && catalogVersion > 0 && assessmentVersion > 0);
      const fingerprint = linked ? oldEvidence?.fingerprint : "unknown";
      const recordedAt = oldEvidence?.recordedAt;
      const at = validTimestamp2(recordedAt) ? recordedAt : "1970-01-01T00:00:00.000Z";
      const linkedEvidence = linked && oldEvidence ? {
        attemptId: `legacy:${id}`.slice(0, idLimit),
        contentVersion: catalogVersion,
        assessmentVersion,
        fingerprint,
        source: oldEvidence.source,
        at
      } : void 0;
      const event = {
        id: `legacy:${id}`.slice(0, idLimit),
        kind: linked ? "verified" : completed.has(id) || answers[id] === true || key.some((candidate) => warmups[candidate] === true) ? "studied" : "attempted",
        attemptId: `legacy:${id}`.slice(0, idLimit),
        at,
        fingerprint,
        assisted: true,
        source: "browser"
      };
      const state = linked ? "verified" : event.kind === "studied" ? "studied" : "attempted";
      const record2 = {
        schemaVersion: 1,
        contentVersion: catalogVersion,
        assessmentVersion,
        mode: "learn",
        state,
        assisted: true,
        attemptId: event.attemptId,
        attemptIndependent: false,
        currentFingerprint: fingerprint,
        currentUpdatedAt: at,
        attemptHistory: [{ attemptId: event.attemptId, startedAt: at }],
        ...linkedEvidence ? { verifiedEvidence: linkedEvidence } : {},
        evidenceHistory: linkedEvidence ? [linkedEvidence] : [],
        events: [event]
      };
      learning[id] = record2;
    }
    clone.exerciseLearning = learning;
    return clone;
  }
  return __toCommonJS(learning_progress_exports);
})();
globalThis.DevPathLearningProgress = DevPathLearningProgress;
