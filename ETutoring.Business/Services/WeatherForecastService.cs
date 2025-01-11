using ETutoring.Business.Interfaces;
using ETutoring.DataAccess.Entities;
using ETutoring.DataAccess.Interfaces;

namespace ETutoring.Business.Services;

public class WeatherForecastService : IWeatherForecastService
{
    private readonly IWeatherForecastRepository _repository;

    public WeatherForecastService(IWeatherForecastRepository repository)
    {
        _repository = repository;
    }

    public IEnumerable<WeatherForecast> GetWeatherForecasts()
    {
        return _repository.GetAllWeatherForecasts();
    }
}