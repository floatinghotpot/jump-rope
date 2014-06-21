var ActName = [
"看书",
"拖地",
"扫地",
"园艺",
"洗碗",
"看电视",
"看电影",
"烫衣服",
"洗衣服",
"泡澡",

"睡觉",
"遛狗",
"上楼梯",
"下楼梯",
"随意走动",
"慢走",
"逛街",
"坐着",
"站着",
"骑脚踏车",

"开车",
"游泳(随意)",
"游泳(蝶式)",
"羽毛球",
"游泳(仰式)",
"游泳(自由式)",
"跳绳",
"体能训练",
"排球",
"壁球",

"武术",
"有氧操",
"柔软体操 ",
"舞蹈(中度-激烈)",
"舞蹈(华尔滋-伦巴)",
"舞蹈(方块舞)",
"瑜伽(伸展运动)",
"瑜伽(高强度)",
"普拉提",
"溜冰",

"打高尔夫",
"滑雪",
"爬山",
"郊游",
"骑马",
"划船",
"足球",
"网球",
"棒球",
"跑步(16公里/小时)",

"跑步(8公里/小时)",
"跑步(12公里/小时)",
"跑步(20公里/小时)",
"篮球" ];

var ActCalorie = [ 
1.464, 3.9, 3.7, 3.7, 2.28, 1.2, 1.466, 2.0, 1.90, 2.80, 
0.8, 2.166, 14, 7.1, 3.1, 4.25, 1.83, 1.10, 1.766, 3, 
1.38, 6, 9.3, 14, 9.3, 12, 5.0, 4.38, 5.8, 12.466, 
13.166, 4.2, 5, 5, 6.4, 7.7, 4.083, 1.70, 3.95, 10, 
3.12, 5.88, 17, 4, 4.6, 5.88, 9, 9, 4.7, 20, 
10, 15, 25, 7.5 ];

// 以上数据是60kg体重运动1分钟消耗的热量 

function burnCaloriePerMinute( act ) {
	for(var i=0; i<ActName.length; i++) {
		if(ActName[i] == act) return ActCalorie[i];
	}
	return 0;
}


function burnCalorie(weightkg, minute, permin) {
	return permin * minute * (weightkg / 60.0);
}

// 人体每减掉1公斤脂肪，大约需要消耗7700大卡热量。

function burnFat(calorie) {
	return calorie / 7700.0;
}
