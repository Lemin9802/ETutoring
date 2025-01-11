using ETutoring.DataAccess.Entities;

namespace ETutoring.DataAccess.Interfaces;

public interface IWeatherForecastRepository
{
    IEnumerable<WeatherForecast> GetAllWeatherForecasts();
}