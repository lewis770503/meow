var app = new Vue({
  el: "#app",
  data() {
    return {
      dateData: [],
      dateSelect: "",
      tagCheck: false,
      err: {
        learnErr: "",
        dateErr: "",
      },
      growingDefault: [],
      onlineDefault: [],
      localDefault: [],
      everyDayClass: {
        growingData: [],
        localData: [],
        onlineData: [],
      },
      weekClass: {
        growingData: [],
        localData: [],
        onlineData: [],
      },
      monthClass: {},
      filterData: {
        growing: [],
        local: [],
        online: [],
      },
    };
  },
  created() {
    const dateFile = "./file/date.xlsx",
      learnFile = "./file/newLearn.xlsx",
      set = new Set();
    axios
      .get(learnFile, { responseType: "arraybuffer" })
      .then((res) => {
        let xlsx_data = new Uint8Array(res.data);
        let excelData = XLSX.read(xlsx_data, {
          type: "array",
          cellText: false,
          cellDates: true,
        });
        let jsonData = Object.keys(excelData.Sheets).map((name) => ({
          name,
          data: XLSX.utils.sheet_to_json(excelData.Sheets[name], {
            header: 0,
            raw: false,
            dateNF: "m/d",
          }),
        }));
        let resData = jsonData[0].data;
        this.monthClass = resData.filter((item) => {
          return item.Lesson === "每月固定課程";
        });
        this.everyDayClass.growingData = resData.filter((item) => {
          return item.className === "growing" && item.classDay === "每天";
        });
        this.everyDayClass.localData = resData.filter((item) => {
          return (
            item.className === "sharing" &&
            item.classType === "實體現場" &&
            item.classDay === "每天"
          );
        });
        this.everyDayClass.onlineData = resData.filter((item) => {
          return (
            item.className === "sharing" &&
            item.classType === "線上直播" &&
            item.classDay === "每天"
          );
        });
        this.weekClass.growingData = resData
          .filter((item) => {
            return (
              item.className === "growing" &&
              item.Lesson === "每周固定課程" &&
              item.classDay !== "每天"
            );
          })
          .filter((item) =>
            !(set.has(item.Title) && set.has(item.classDay))
              ? set.add(item.Title) && set.add(item.classDay)
              : false
          );
        this.weekClass.localData = resData
          .filter((item) => {
            return (
              item.className === "sharing" &&
              item.classType === "實體現場" &&
              item.Lesson === "每周固定課程" &&
              item.classDay !== "每天"
            );
          })
          .filter((item) =>
            !(set.has(item.Title) && set.has(item.classDay))
              ? set.add(item.Title) && set.add(item.classDay)
              : false
          );
        this.weekClass.onlineData = resData
          .filter((item) => {
            return (
              item.className === "sharing" &&
              item.classType === "線上直播" &&
              item.Lesson === "每周固定課程" &&
              item.classDay !== "每天"
            );
          })
          .filter((item) =>
            !(set.has(item.Title) && set.has(item.classDay))
              ? set.add(item.Title) && set.add(item.classDay)
              : false
          );
        this.growingDefault = resData.filter((item) => {
          return (
            item.className === "growing" &&
            item.Lesson !== "每月固定課程" &&
            item.classDay !== "每天"
          );
        });
        this.onlineDefault = resData.filter((item) => {
          return (
            item.className === "sharing" &&
            item.classType === "線上直播" &&
            item.Lesson !== "每月固定課程" &&
            item.classDay !== "每天"
          );
        });
        this.localDefault = resData.filter((item) => {
          return (
            item.className === "sharing" &&
            item.classType === "實體現場" &&
            item.Lesson !== "每月固定課程" &&
            item.classDay !== "每天"
          );
        });
      })
      .catch((err) => {
        this.err.learnErr = err;
      });
    axios
      .get(dateFile, { responseType: "arraybuffer" })
      .then((res) => {
        let xlsx_data = new Uint8Array(res.data);
        let excelData = XLSX.read(xlsx_data, {
          type: "array",
          cellText: false,
          cellDates: true,
        });
        let jsonData = Object.keys(excelData.Sheets).map((name) => ({
          name,
          data: XLSX.utils.sheet_to_json(excelData.Sheets[name], {
            header: 0,
            raw: false,
            dateNF: "m/d",
          }),
        }));
        let resData = jsonData[0].data;
        this.dateData = resData;
      })
      .catch((err) => {
        this.err.learnErr = err;
      });
  },
  computed: {
    growingClass() {
      let growingNewData = [];
      for (let i = 0; i < this.dateData.length; i++) {
        let _classDay = this.dateData[i].dfDay,
          _classDate = this.dateData[i].dfDate;
        if (this.everyDayClass.growingData.length > 0) {
          for (let j = 0; j < this.everyDayClass.growingData.length; j++) {
            let _everyDay;
            _everyDay = Object.assign({}, this.everyDayClass.growingData[j]);
            _everyDay.classDate = _classDate;
            _everyDay.classDay = _classDay;
            growingNewData = growingNewData.concat(_everyDay);
          }
        }
        if (this.weekClass.growingData.length > 0) {
          for (let k = 0; k < this.weekClass.growingData.length; k++) {
            let _weekDay = this.weekClass.growingData[k].classDay,
              _weekDate = this.weekClass.growingData[k].classDate;
            if (_weekDay.indexOf(_classDay) >= 0 && _classDate !== _weekDate) {
              let _weekDay;
              _weekDay = Object.assign({}, this.weekClass.growingData[k]);
              _weekDay.classDate = _classDate;
              _weekDay.classDay = _classDay;
              growingNewData = growingNewData.concat(_weekDay);
            }
          }
        }
      }
      growingNewData = growingNewData.concat(this.growingDefault);
      growingNewData = [
        ...new Set(growingNewData.map((item) => JSON.stringify(item))),
      ].map((item) => JSON.parse(item));
      growingNewData
        .sort((a, b) => {
          let aNum = a.classTime ? Number(a.classTime.substr(0, 2)) : 0,
            bNum = b.classTime ? Number(b.classTime.substr(0, 2)) : 0;
          return aNum - bNum;
        })
        .sort((a, b) => {
          return new Date(a.classDate) - new Date(b.classDate);
        });
      return growingNewData;
    },
    onlineClass() {
      let newOnlineData = [];
      for (let i = 0; i < this.dateData.length; i++) {
        let _classDay = this.dateData[i].dfDay,
          _classDate = this.dateData[i].dfDate;
        if (this.everyDayClass.onlineData.length > 0) {
          for (let j = 0; j < this.everyDayClass.onlineData.length; j++) {
            let _everyDay;
            _everyDay = Object.assign({}, this.everyDayClass.onlineData[j]);
            _everyDay.classDate = _classDate;
            // _everyDay.classDay = _classDay;
            newOnlineData = newOnlineData.concat(_everyDay);
          }
        }
        if (this.weekClass.onlineData.length > 0) {
          for (let k = 0; k < this.weekClass.onlineData.length; k++) {
            let _weekDay = this.weekClass.onlineData[k].classDay,
              _weekDate = this.weekClass.onlineData[k].classDate;
            if (_weekDay.indexOf(_classDay) >= 0 && _classDate !== _weekDate) {
              let _weekDay;
              _weekDay = Object.assign({}, this.weekClass.onlineData[k]);
              _weekDay.classDate = _classDate;
              // _weekDay.classDay = _classDay;
              newOnlineData = newOnlineData.concat(_weekDay);
            }
          }
        }
      }
      newOnlineData = newOnlineData.concat(this.onlineDefault);
      newOnlineData = [
        ...new Set(newOnlineData.map((item) => JSON.stringify(item))),
      ].map((item) => JSON.parse(item));
      newOnlineData
        .sort((a, b) => {
          let aNum = a.classTime ? Number(a.classTime.substr(0, 2)) : 0,
            bNum = b.classTime ? Number(b.classTime.substr(0, 2)) : 0;
          return aNum - bNum;
        })
        .sort((a, b) => {
          return new Date(a.classDate) - new Date(b.classDate);
        });
      return newOnlineData;
    },
    localClass() {
      let newLocalData = [];
      for (let i = 0; i < this.dateData.length; i++) {
        let _classDay = this.dateData[i].dfDay,
          _classDate = this.dateData[i].dfDate;
        if (this.everyDayClass.localData.length > 0) {
          for (let j = 0; j < this.everyDayClass.localData.length; j++) {
            let _everyDay;
            _everyDay = Object.assign({}, this.everyDayClass.localData[j]);
            _everyDay.classDate = _classDate;
            // _everyDay.classDay = _classDay;
            newLocalData = newLocalData.concat(_everyDay);
          }
        }
        if (this.weekClass.localData.length > 0) {
          for (let k = 0; k < this.weekClass.localData.length; k++) {
            let _weekDay = this.weekClass.localData[k].classDay,
              _weekDate = this.weekClass.localData[k].classDate;
            if (_weekDay.indexOf(_classDay) >= 0 && _classDate !== _weekDate) {
              let _weekDay;
              _weekDay = Object.assign({}, this.weekClass.localData[k]);
              _weekDay.classDate = _classDate;
              // _weekDay.classDay = _classDay;
              newLocalData = newLocalData.concat(_weekDay);
            }
          }
        }
      }
      newLocalData = newLocalData.concat(this.localDefault);
      newLocalData = [
        ...new Set(newLocalData.map((item) => JSON.stringify(item))),
      ].map((item) => JSON.parse(item));
      newLocalData
        .sort((a, b) => {
          let aNum = a.classTime ? Number(a.classTime.substr(0, 2)) : 0,
            bNum = b.classTime ? Number(b.classTime.substr(0, 2)) : 0;
          return aNum - bNum;
        })

        .sort((a, b) => {
          let aNum = a.Address.substr(0, 2),
            bNum = b.Address.substr(0, 2);
          // console.log('address', aNum, bNum);
          return aNum - bNum;
        })
        .sort((a, b) => {
          return new Date(a.classDate) - new Date(b.classDate);
        });
      return newLocalData;
    },
  },
  methods: {},

  watch: {
    dateSelect(newValue, oldValue) {
      // console.log('newValue, oldValue:', newValue, oldValue);
      this.filterData.growing = this.growingClass.filter((item) => {
        // console.log('item:', item);
        return item.classDate === this.dateSelect;
      });
      this.filterData.online = this.onlineClass.filter((item) => {
        // console.log('item:', item);
        return item.classDate === this.dateSelect;
      });
      this.filterData.local = this.localClass.filter((item) => {
        // console.log('item:', item);
        return item.classDate === this.dateSelect;
      });
    },
  },
});
