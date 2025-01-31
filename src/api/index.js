import { statusMapper } from '../constants';
import { instance } from '@redhat-cloud-services/frontend-components-utilities/interceptors/interceptors';

const randomNumber = (min, max) =>
  Math.round(Math.random() * (max - min) + min);
const randomString = () => Math.random().toString(36).substr(2, 10);
// const randomBool = () => Boolean(Math.round(Math.random() * 10) % 2);
const randomDate = (offset = 10000000000) =>
  new Date(+new Date() - Math.floor(Math.random() * offset));

const randomUUID = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });

const randomStatus = () =>
  statusMapper[randomNumber(0, statusMapper.length - 1)];

const rowGroupCreator = (uuid, name, sensors, isSecure, lastSeen) => ({
  uuid,
  name,
  sensors,
  is_secure: isSecure,
  last_seen: lastSeen,
  status: randomStatus(),
});

const rowGroupDetailCreator = (uuid, version, status) => {
  return {
    uuid,
    version,
    status,
  };
};

const groups = [];

export const fetchGroups = ({ perPage, page }) => {
  const currPage = page || 1;
  const currPerPage = perPage || 20;
  return insights.chrome.auth.getUser().then(() => ({
    results: groups,
    meta: {
      count: groups.length,
      limit: currPerPage * currPage,
      offset: currPerPage * (currPage - 1),
    },
  }));
};

export const threshold = () => {
  const sections = randomNumber(2, 5);
  let rest = 100;
  return Promise.resolve({
    results: [...new Array(sections)].map(() => {
      const currPercent = randomNumber(0, rest);
      rest = rest - currPercent;
      return {
        [randomString()]: currPercent,
      };
    }),
  });
};

export const devicesInfo = (devicesCount) => {
  return Promise.resolve({
    results: {
      requiredApproval: devicesCount || 0,
      orphaned: 0,
      delivering: 0,
    },
  });
};

export const canariesInfo = () => {
  const canaries = randomNumber(0, 100);
  return Promise.resolve({
    results: [...new Array(canaries)].map(() => ({
      group: {
        name: randomString(),
        uuid: randomUUID(),
      },
      date: randomDate(),
      status: randomStatus(),
    })),
  });
};

export const groupsDetail = (uuid, { page, perPage }) => {
  const currPage = page || 1;
  const currPerPage = perPage || 20;
  const status = randomStatus();
  const group = groups.find(({ uuid: groupUUID }) => uuid === groupUUID);
  return Promise.resolve({
    uuid,
    name: group?.name || randomString(),
    results: group?.sensors?.map((uuid) =>
      rowGroupDetailCreator(
        uuid,
        `${randomNumber(0, 10)}.${randomNumber(0, 10)}`,
        status
      )
    ),
    meta: {
      count: group?.sensors?.length || 0,
      limit: currPerPage * currPage,
      offset: currPerPage * (currPage - 1),
    },
  });
};

export const groupDevicesInfo = (uuid) => {
  return Promise.resolve({
    uuid,
    total: 200,
    newDevices: randomNumber(0, 50),
    offlineDevices: randomNumber(0, 50),
    deliveringDevices: randomNumber(0, 50),
  });
};

export const createNewGroup = ({ groupName, isSecure, systemIDs }) => {
  groups.push(
    rowGroupCreator(randomUUID(), groupName, systemIDs, isSecure, new Date())
  );
  return Promise.resolve();
};

export const updateGroup = ({ uuid, systemIDs, groupName }) => {
  const group = groups.find(({ uuid: groupUUID }) => groupUUID === uuid);
  if (group) {
    group.sensors = systemIDs;
  } else {
    groups.push(rowGroupCreator(uuid, groupName, systemIDs, false, new Date()));
  }
  return Promise.resolve();
};

export const fetchActiveImages = () => {
  return instance.get('/api/image-builder/v1/composes');
};
